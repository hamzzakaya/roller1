import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactEcharts from 'echarts-for-react';

function App() {
  const [currentData, setCurrentData] = useState({});
  const [historicalData, setHistoricalData] = useState({});
  const [error, setError] = useState(null);

  // Grup adları
  const groupNames = [
    'A8', 'A9', 'A10', 'A11', 'A12', 'A13', 'A14', 'A15', 'A16',
    'A17', 'A18', 'A19', 'A20', 'A21', 'A22', 'GRS BACA'
  ];

  // Güncel verileri çekme işlemi
  useEffect(() => {
    const fetchCurrentData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/'); // Backend URL'inizi buraya ekleyin
        const parsedData = parseHTML(response.data);
        setCurrentData(parsedData);
      } catch (error) {
        setError('Güncel verileri çekerken hata oluştu.');
        console.error(error);
      }
    };
  
    // Veriyi her 5 saniyede bir çek
    const interval = setInterval(fetchCurrentData, 5000);
    fetchCurrentData(); // İlk sayfa yüklendiğinde de veriyi çekmek için bu satırı ekleyin
    return () => clearInterval(interval); // Bileşen kapatıldığında interval'i temizle
  }, []);
  
  

  // Geçmiş verileri çekme işlemi
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/historical-data'); // Backend URL ve path'inin doğruluğunu kontrol edin
        const transformedData = transformData(response.data);
        setHistoricalData(transformedData);
      } catch (error) {
        setError('Geçmiş verileri çekerken hata oluştu.');
        console.error(error);
      }
    };
  
    fetchHistoricalData();
  }, []);
  

  // Geçmiş veriyi grafiğe uygun formata dönüştürme fonksiyonu
  const transformData = (data) => {
    const transformed = {};
    groupNames.forEach(groupName => {
      transformed[groupName] = data
        .filter(d => d.name === groupName)
        .map(d => ({
          value: d.value,
          timestamp: new Date(d.timestamp).toLocaleTimeString()
        }));
    });
    return transformed;
  };

  // Grafikleri render etme fonksiyonu
  const renderCharts = (data, title) => {
    console.log("Rendering Charts with Data:", data); // Bu satırı ekleyin ve gelen veriyi kontrol edin
    return groupNames.map((groupName) => {
      const groupData = data[groupName] || [];
  
      if (groupData.length === 0) return null;
  
      const options = {
        title: { text: `${groupName} ${title}` },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: groupData.map(d => d.timestamp) },
        yAxis: { type: 'value' },
        series: [{
          name: 'Sıcaklık',
          type: 'line',
          data: groupData.map(d => d.value),
          label: { show: true, position: 'top', formatter: '{c}' },
        }],
      };
  
      return (
        <div key={groupName} style={{ marginBottom: '30px' }}>
          <ReactEcharts option={options} style={{ height: '400px', width: '100%' }} />
        </div>
      );
    });
  };
  

  return (
    <div className="App">
      <h1>Fırın Sıcaklık Değerleri</h1>
      {error ? <p>Error: {error}</p> : null}
      <h2>Güncel Veriler</h2>
      {renderCharts(currentData, 'Güncel Sıcaklık Grafiği')}
      <h2>Geçmiş Veriler</h2>
      {renderCharts(historicalData, 'Geçmiş Sıcaklık Grafiği')}
    </div>
  );
}

// Gelen HTML verisini JSON formatına dönüştüren fonksiyon
function parseHTML(html) {
  const rows = new DOMParser().parseFromString(html, 'text/html').querySelectorAll('tr');
  const newData = Array.from(rows).map(row => {
    const name = row.querySelector('span')?.innerText;
    const value = parseFloat(row.cells[1]?.innerText);
    return { name, value, timestamp: new Date().toISOString() };
  }).filter(d => d.name && !isNaN(d.value));

  const data = {};
  newData.forEach(({ name, value, timestamp }) => {
    if (!data[name]) {
      data[name] = [];
    }
    data[name].push({ value, timestamp });
  });

  return data;
}

export default App;
