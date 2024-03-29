import React, { Component, createRef } from "react";
import Chart from "chart.js";

var defaults = [
  { name: "example", value: "5" },
  { name: "example", value: "5" },
  { name: "example", value: "5" },
];
export default class DoughnutChart extends Component {
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
    this.myChart = new Chart(this.chartRef.current, {
      type: "doughnut",
      options: {
        legend: {
          position: "left",
        },
      },
      data: {
        labels: this.returnDataNames(),
        datasets: [
          {
            data: this.returnDataValues(),
            backgroundColor: [
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
            ],
          },
        ],
      },
    });
  };

  render() {
    return <canvas ref={this.chartRef} />;
  }
}
