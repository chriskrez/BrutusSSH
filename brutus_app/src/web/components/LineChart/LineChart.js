import React from "react";
import Chart from "chart.js";

export default class LineChart extends React.Component {
  constructor(props) {
    super(props);
    this.chartRef = React.createRef();
  }

  componentDidUpdate() {
    this.myChart.data.labels = this.props.data.map((d) => d.name);
    this.myChart.data.datasets[0].data = this.props.data.map((d) => d.value);
    this.myChart.update();
  }

  componentDidMount() {
    this.myChart = new Chart(this.chartRef.current, {
      type: "line",
      options: {
        scales: {
          yAxes: [
            {
              type: "logarithmic",
              ticks: {
                maxTicksLimit: 8,
                callback: (label, index, labels) => label,
              },
            },
          ],
        },
      },
      data: {
        labels: this.props.data.map((d) => d.name),
        datasets: [
          {
            label: this.props.title,
            data: this.props.data.map((d) => d.value),
            fill: "none",
            backgroundColor: "##65334D",
            pointRadius: 2,
            borderColor: "#65334D",
            borderWidth: 1,
            lineTension: 0,
          },
        ],
      },
    });
  }

  render() {
    return <canvas ref={this.chartRef} />;
  }
}
