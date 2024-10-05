import React, { useEffect, useState } from "react";
import axios from "axios";
import * as Realm from "realm-web";
import LineChart from "./components/LineChart";

const calculateMinMax = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) {
    return "N/A";
  }
  const min = Math.floor((Math.min(...arr) - 10) / 10) * 10;
  const max = Math.ceil((Math.max(...arr) + 10) / 10) * 10;
  return `${min}-${max}`;
};

const timeStampToHumanDate = (timeStamp) => {
  const date = new Date(timeStamp);
  const hours = date.getHours();
  const minutes = "0" + date.getMinutes();
  const seconds = "0" + date.getSeconds();
  const day = date.toLocaleDateString();
  const formattedTime = `${day}-${hours}:${minutes.substr(-2)}:${seconds.substr(
    -2
  )}`;
  return formattedTime;
};

const transformData = (data) => {
  const transformed = {};
  if (data.length) {
    transformed["saat"] = data[0]?.values.map((e) =>
      timeStampToHumanDate(e.time)
    );
    data.forEach((d) => {
      transformed[d.name] = d?.values.map((e) => e.value);
    });
  }
  delete transformed["SÜRE"];
  return transformed;
};

function App() {
  const [user, setUser] = useState(null);
  const [expandedChart, setExpandedChart] = useState(null);
  const [chartData, setChartData] = useState({});

  const colors = {
    A8: "#ff9f1c",
    A9: "#f9c159",
    A10: "#f6e887",
    A11: "#b0f5ba",
    A12: "#9ceaef",
    A13: "#d2d7e7",
    A14: "#afbcc1",
    A15: "#fdfdcc",
    A16: "#e3e7e7",
    A17: "#ffd7b5",
    A18: "#ccd5ae",
    A19: "#e9edc9",
    A20: "#fefae0",
    A21: "#faedcd",
    A22: "#d4a373",
    "GRS BACA": "#e4b19b",
    SÜRE: "#ccd5ae",
  };

  const appId = "data-xnlepwl";
  const mongoDBEndpoint =
    "https://eu-central-1.aws.data.mongodb-api.com/app/data-xnlepwl/endpoint/data/v1/action/";

  const loginEmailPassword = async (email, password) => {
    const app = new Realm.App({ id: appId });
    const credentials = Realm.Credentials.emailPassword(email, password);
    const loggedUser = await app.logIn(credentials);
    return loggedUser.accessToken;
  };

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const accessToken = await loginEmailPassword(
          "hamzakaya4343@gmail.com",
          "hmzhmzky"
        );
        setUser(accessToken);
      } catch (error) {
        console.error(error);
      }
    };

    initializeUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchCurrentData = async () => {
      const data = JSON.stringify({
        collection: "tempV3",
        database: "temperature_data",
        dataSource: "Cluster0",
      });

      const config = {
        method: "post",
        url: `${mongoDBEndpoint}find`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user}`,
        },
        data: data,
      };

      try {
        const response = await axios(config);
        const data = response.data.documents;
        const sortedData = data.map((d) => {
          const tmpData = {
            ...d,
            values: d.values.sort((a, b) => a.time - b.time),
          };
          return tmpData;
        });
        const transformedData = transformData(sortedData);
        setChartData(transformedData);
      } catch (error) {
        console.error(error);
      }
    };

    const interval = setInterval(fetchCurrentData, 300000);
    fetchCurrentData();
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div style={{ padding: "20px" }}>
      {expandedChart ? (
        <LineChart
          backgroundColor={colors[expandedChart]}
          yAxisData={chartData[expandedChart]}
          leftYAxisName={calculateMinMax(chartData[expandedChart])}
          rightYAxisName={expandedChart}
          xAxisData={chartData.saat}
          isXAxisShow={true}
          onClick={() => setExpandedChart(expandedChart)}
          isExpanded={true}
          onClose={() => setExpandedChart(null)}
        />
      ) : (
        Object.keys(chartData).map(
          (key) =>
            key !== "saat" && (
              <LineChart
                key={key}
                backgroundColor={colors[key]} // Her grafik için özel arka plan rengi
                yAxisData={chartData[key]}
                leftYAxisName={calculateMinMax(chartData[key])}
                rightYAxisName={key}
                xAxisData={chartData.saat}
                isXAxisShow={key === "GRS BACA"}
                onClick={() => setExpandedChart(key)} // Tıklandığında ilgili grafiği genişletiyoruz
              />
            )
        )
      )}
    </div>
  );
}

export default App;
