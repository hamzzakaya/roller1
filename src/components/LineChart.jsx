import React from "react";
import ReactEcharts from "echarts-for-react";

export default function LineChart({
  backgroundColor,
  yAxisData,
  leftYAxisName,
  rightYAxisName,
  xAxisData,
  isXAxisShow = false,
}) {
  const minMax = leftYAxisName && leftYAxisName.split("-");
  const min = parseInt(minMax[0]);
  const max = parseInt(minMax[1]);
  const interval = (max - min) / 4;

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
    },
    grid: {
      height: 50,
      backgroundColor: backgroundColor,
      show: true,
      top: 0,
      bottom: 0,
    },
    toolbox: {
      feature: {
        dataView: { show: true, readOnly: false },
        restore: { show: true },
        saveAsImage: { show: true },
      },
    },
    legend: {
      data: [rightYAxisName], // Legend name'i, series'deki name ile aynı yapın
    },
    xAxis: [
      {
        type: "category",
        axisTick: {
          show: isXAxisShow,
        },
        axisLine: {
          show: isXAxisShow,
        },
        axisLabel: {
          show: isXAxisShow,
        },
        splitLine: {
          show: false,
        },
        data: xAxisData,
      },
    ],
    yAxis: [
      {
        type: "value",
        name: leftYAxisName,
        position: "left",
        nameRotate: 0,
        nameLocation: "center",
        alignTicks: true,
        min: min,
        max: max,
        interval: interval,
        axisTick: {
          show: true,
        },
        axisLine: {
          show: true,
        },
        axisLabel: {
          show: false,
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "#ccc",
            type: "dotted",
          },
        },
      },
      {
        type: "category",
        name: rightYAxisName,
        nameLocation: "center",
        nameRotate: 0,
        position: "right",
        alignTicks: true,
        axisLine: {
          show: true,
        },
      },
    ],
    series: [
      {
        name: rightYAxisName, // Series name'i buraya ekleyin
        type: "line",
        yAxisIndex: 0,
        data: yAxisData,
        areaStyle: {}, // Burada alan stili uygulayabilirsiniz
        smooth: true, // Grafiği yumuşatmak için
        itemStyle: {
          color: backgroundColor, // Grafiğin çizgi rengi
          borderColor: backgroundColor,
          borderWidth: 2,
        },
        lineStyle: {
          width: 2,
        },
        areaStyle: {
          color: backgroundColor, // Alanın rengi
          opacity: 0.3, // Alanın opaklığı
        },
      },
    ],
  };
  return (
    <ReactEcharts
      option={option}
      style={{ height: isXAxisShow ? "150px" : "50px", width: "100%" }}
    />
  );
}
