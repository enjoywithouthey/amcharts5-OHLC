import React, { useLayoutEffect } from 'react';
import './App.css';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

function OHLC(props) {
  useLayoutEffect(() => {
    
let root = am5.Root.new("chartdiv");
root.setThemes([am5themes_Animated.new(root)]);

function generateChartData() {
  let chartData = [];
  let firstDate = new Date();
  firstDate.setDate(firstDate.getDate() - 1000);
  firstDate.setHours(0, 0, 0, 0);
  let value = 1200;
  for (var i = 0; i < 5000; i++) {
    let newDate = new Date(firstDate);
    newDate.setDate(newDate.getDate() + i);

    value += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10);
    let open = value + Math.round(Math.random() * 16 - 8);
    let low = Math.min(value, open) - Math.round(Math.random() * 5);
    let high = Math.max(value, open) + Math.round(Math.random() * 5);
    

    // ================== RANDOMLY CREATE A TYPE AND COLOR FOR EACH CANDLE ================
    const myTypes = ['Type 1', 'Type 2', 'Type 3', 'Type 4'];
    const myColors = [0x000000,0xff0000,0x00ff00,0x0000ff]
    const j = [1, -1]
    let idx = Math.floor(Math.random() * 4);
    let type = myTypes[idx]
    let typeColor = myColors[idx]; 

    chartData.push({
      date: newDate.getTime(),
      value: value,
      open: open,
      low: low,
      high: high,
      type: type,
      typeColor: typeColor,
    });
  }
  return chartData;
}

let data = generateChartData();

let chart = root.container.children.push(
  am5xy.XYChart.new(root, {
    focusable: true,
    panX: true,
    panY: true,
    wheelX: "panX",
    wheelY: "zoomX",
  })
);

let xAxis = chart.xAxes.push(
  am5xy.DateAxis.new(root, {
    groupData: true,
    maxDeviation:0.5,
    baseInterval: { timeUnit: "day", count: 1 },
    renderer: am5xy.AxisRendererX.new(root, {pan:"zoom"}),
    tooltip: am5.Tooltip.new(root, {}),
  })
);

let yAxis = chart.yAxes.push(
  am5xy.ValueAxis.new(root, {
    maxDeviation:1,
    renderer: am5xy.AxisRendererY.new(root, {pan:"zoom"}),
  })
);

let series = chart.series.push(
  am5xy.CandlestickSeries.new(root, {
    fill: "typeColor", // <- A different color for each candle from "typeColor". Doesn't work
    calculateAggregates: true,
    stroke: "typeColor", // <- A different color for each candle from "typeColor". Doesn't work
    name: "Each candle should change color based on type:",
    xAxis: xAxis,
    yAxis: yAxis,
    valueYField: "value",
    openValueYField: "open",
    lowValueYField: "low",
    highValueYField: "high",
    valueXField: "date",
    lowValueYGrouped: "low",
    highValueYGrouped: "high",
    openValueYGrouped: "open",
    valueYGrouped: "close",
    type: "type", // <- random type generated in data.
    typeColor: "typeColor", // <- adding typeColor to the series object
    legendValueText:
      `    {type}   `,
    legendRangeValueText: "{valueYClose}",
    tooltip: am5.Tooltip.new(root, {
      getFillFromSprite: true,
      pointerOrientation: "horizontal",
      labelText: "{type}",
    })
  })
);

// ============================ BEGIN CANDLESTICK NIGHTMARE ============================

series.columns.template.set("themeTags", []);  // <- Remove defaults Green/Red, but doesn't help

// FROM amcharts Doc
// Only globally changes candlecolors:
// https://www.amcharts.com/docs/v5/charts/xy-chart/series/candlestick-series/
// series.columns.template.states.create("riseFromOpen", {
//     fill: am5.color('#ff9800'),
//     stroke: am5.color('#ff9800')
//   });
  // series.columns.template.states.create("dropFromOpen", {
// fill: am5.color('#000000'),
// stroke: am5.color('#000000')
// });

// Trying solution from Github for amChart4, I cannot implement this in amChart5
// https://github.com/amcharts/amcharts4/issues/2017
// delete series.riseFromOpenState.properties.fill;
// delete series.dropFromOpenState.properties.fill;
series.columns.template.states.remove("riseFromOpen")
series.columns.template.states.remove("dropFromOpen")

series.columns.template.states.create("riseFromOpem", {
      fill: am5.color('#ff0000'),
    });

series.columns.template.states.create("riseFromOpem", (fill, target) => {
  if (target.dataItem) {
    if((target.dataItem.type === 'Type 1')){
       return am5.color("#ff0000");  
    }
    // target.riseFromOpenState.properties.fill = am4core.color("#000000");
    // target.dropFromOpenState.properties.fill = am4core.color("#000000");
    
  }
  return fill;
});

// ============================ END CANDLESTICK NIGHTMARE ============================

root.interfaceColors.set("text", '#ffffff')

let cursor = chart.set(
  "cursor",
  am5xy.XYCursor.new(root, {
    xAxis: xAxis
  })
);
cursor.lineY.set("visible", false);

chart.leftAxesContainer.set("layout", root.verticalLayout);
let legend = yAxis.axisHeader.children.push(am5.Legend.new(root, {}));

yAxis.axisHeader.get("background").setAll({
    fill: am5.color("#000000"),
    fillOpacity: 0.4
  });

legend.data.push(series);
legend.markers.template.setAll({
  width: 10,
});

legend.markerRectangles.template.setAll({
  cornerRadiusTR: 0,
  cornerRadiusBR: 0,
  cornerRadiusTL: 0,
  cornerRadiusBL: 0
});

series.data.setAll(data);
series.appear(1000);
chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, []);

  return (
    <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
  );
}
export default OHLC;
