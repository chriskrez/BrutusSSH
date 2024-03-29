import React, { Component, createRef } from "react";
import Chart from "chart.js";

var defaults = [
  { name: "example", value: "5" },
  { name: "example", value: "5" },
  { name: "example", value: "5" },
];

export default class BarChart extends Component {
  constructor(props) {
    super(props);
    this.chartRef = createRef();
  }

  returnDataNames = () => {
    return this.props.data.length
      ? this.props.data.map((d) => d.name)
      : defaults.map((d) => d.name);
  };

  returnDataValues = () => {
    return this.props.data.length
      ? this.props.data.map((d) => d.value)
      : defaults.map((d) => d.value);
  };

  componentDidUpdate = () => {
    this.myChart.data.labels = this.returnDataNames();
    this.myChart.data.datasets[0].data = this.returnDataValues();
    this.myChart.update();
  };

  componentDidMount = () => {
    var colors = [
      "#a8e0ff",
      "#36827F",
      "#65334D",
      "#934683",
      "#8ee3f5",
      "#70cad1",
      "#3e517a",
      "#b08ea2",
      "#BBB6DF",
      "#877666",
    ];

    var backgroundColors = [];
    for (var i = 0; i < this.returnDataNames().length; i++) {
      backgroundColors[i] = colors[i % 10];
    }

    this.myChart = new Chart(this.chartRef.current, {
      type: "bar",
      data: {
        labels: this.returnDataNames(),
        datasets: [
          {
            label: this.props.title,
            data: this.returnDataValues(),
            backgroundColor: backgroundColors,
          },
        ],
      },
      options: {
        scales: {
          yAxes: [
            {
              type: "logarithmic",
              ticks: {
                beginAtZero: true,
                maxTicksLimit: 8,
                callback: (label, index, labels) => label,
              },
            },
          ],
        },
      },
    });
  };

  render() {
    return <canvas ref={this.chartRef} />;
  }
}
