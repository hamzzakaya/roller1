import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactEcharts from "echarts-for-react";
import * as Realm from "realm-web"; // Realm kütüphanesini ekliyoruz

function App() {
  const [currentData, setCurrentData] = useState({});
  const [historicalData, setHistoricalData] = useState({});
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null); // Kullanıcıyı state'e ekliyoruz

  // MongoDB API yapılandırma bilgileri
  const appId = "data-xnlepwl"; // MongoDB Realm App ID
  const mongoDBEndpoint =
    "https://eu-central-1.aws.data.mongodb-api.com/app/data-xnlepwl/endpoint/data/v1/action/";
  const groupNames = [
    "A8",
    "A9",
    "A10",
    "A11",
    "A12",
    "A13",
    "A14",
    "A15",
    "A16",
    "A17",
    "A18",
    "A19",
    "A20",
    "A21",
    "A22",
    "GRS BACA",
  ];

  // Kullanıcı girişi yapma fonksiyonu
  const loginEmailPassword = async (email, password) => {
    const app = new Realm.App({ id: appId });
    const credentials = Realm.Credentials.emailPassword(email, password);
    const loggedUser = await app.logIn(credentials);
    return loggedUser.accessToken;
  };

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Kullanıcı girişini yapıp accessToken alıyoruz
        const accessToken = await loginEmailPassword(
          "hamzakaya4343@gmail.com",
          "hmzhmzky"
        );
        setUser(accessToken); // Erişim belirtecini state'e ekliyoruz
      } catch (error) {
        setError("Kullanıcı girişi sırasında hata oluştu.");
        console.error(error);
      }
    };

    initializeUser();
  }, []);

  // Güncel verileri çekme işlemi
  useEffect(() => {
    if (!user) return; // Eğer kullanıcı girişi yapılmadıysa veriyi çekme

    const fetchCurrentData = async () => {
      const data = JSON.stringify({
        collection: "tempV2",
        database: "temperature_data",
        dataSource: "Cluster0",
      });

      const config = {
        method: "post",
        url: `${mongoDBEndpoint}find`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user}`, // Authorization header ile accessToken ekliyoruz
        },
        data: data,
      };

      try {
        const response = await axios(config);
        const transformedData = transformData(response.data.documents);
        setCurrentData(transformedData);
      } catch (error) {
        setError("Güncel verileri çekerken hata oluştu.");
        console.error(error);
      }
    };

    // Veriyi sayfa yüklendiğinde çek ve her 5 saniyede bir güncelle
    const interval = setInterval(fetchCurrentData, 5000);
    fetchCurrentData(); // İlk sayfa yüklendiğinde veriyi çekmek için bu satır eklendi
    return () => clearInterval(interval); // Bileşen kapatıldığında interval'i temizle
  }, [user]); // user değiştiğinde (giriş yapıldığında) veriyi çek

  // Geçmiş verileri çekme işlemi
  useEffect(() => {
    if (!user) return; // Eğer kullanıcı girişi yapılmadıysa veriyi çekme

    const fetchHistoricalData = async () => {
      const data = JSON.stringify({
        collection: "tempV2",
        database: "temperature_data",
        dataSource: "Cluster0",
      });

      const config = {
        method: "post",
        url: `${mongoDBEndpoint}find`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user}`, // Authorization header ile accessToken ekliyoruz
        },
        data: data,
      };

      try {
        const response = await axios(config);
        const transformedData = transformData(response.data.documents);
        setHistoricalData(transformedData);
      } catch (error) {
        setError("Geçmiş verileri çekerken hata oluştu.");
        console.error(error);
      }
    };

    fetchHistoricalData();
  }, [user]); // user değiştiğinde (giriş yapıldığında) veriyi çek

  // Veriyi grafiğe uygun formata dönüştürme fonksiyonu
  const transformData = (data) => {
    const transformed = {};

    // Her grup için verileri düzenle
    groupNames.forEach((groupName) => {
      // Gelen veride ilgili grup ismini filtrele ve sadece bu gruba ait verileri al
      const groupData = data.find((d) => d.name === groupName);

      if (groupData) {
        transformed[groupName] = groupData.values.map((valueObj) => ({
          value: valueObj.value,
          timestamp: new Date(valueObj.time).toLocaleTimeString(), // Zaman bilgisini uygun formata dönüştür
        }));
      } else {
        transformed[groupName] = []; // Eğer veri yoksa boş dizi ekle
      }
    });

    return transformed;
  };

  // Grafikleri render etme fonksiyonu
  const renderCharts = (data, title) => {
    return groupNames.map((groupName) => {
      const groupData = data[groupName] || [];

      if (groupData.length === 0) return null;

      const options = {
        title: { text: `${groupName} ${title}` },
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: groupData.map((d) => d.timestamp) },
        yAxis: { type: "value" },
        series: [
          {
            name: "Sıcaklık",
            type: "line",
            data: groupData.map((d) => d.value),
            label: { show: true, position: "top", formatter: "{c}" },
          },
        ],
      };

      return (
        <div key={groupName} style={{ marginBottom: "30px" }}>
          <ReactEcharts
            option={options}
            style={{ height: "400px", width: "100%" }}
          />
        </div>
      );
    });
  };

  return (
    <div className="App">
      <h1>Fırın Sıcaklık Değerleri</h1>
      {error ? <p>Error: {error}</p> : null}
      <h2>Güncel Veriler</h2>
      {renderCharts(currentData, "Güncel Sıcaklık Grafiği")}
      <h2>Geçmiş Veriler</h2>
      {renderCharts(historicalData, "Geçmiş Sıcaklık Grafiği")}
    </div>
  );
}

export default App;
