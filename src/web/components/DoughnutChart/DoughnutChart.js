import React, { Component, createRef } from "react";
import Chart from "chart.js";

export default class DoughnutChart extends Component {
  constructor(props) {
    super(props);
    this.chartRef = createRef();
  }

  componentDidUpdate = () => {
    this.myChart.data.labels = this.props.data.map((d) => d.name);
    this.myChart.data.datasets[0].data = this.props.data.map((d) => d.value);
    this.myChart.update();
  };

  componentDidMount = () => {
    this.myChart = new Chart(this.chartRef.current, {
      type: "doughnut",
      data: {
        labels: this.props.data.map((d) => d.name),
        datasets: [
          {
            data: this.props.data.map((d) => d.value),
            backgroundColor: [
              "#a8e0ff",
              "#8ee3f5",
              "#70cad1",
              "#3e517a",
              "#b08ea2",
              "#BBB6DF",
              "#877666",
              "#36827F",
              "#65334D",
              "#934683",
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
