import React, { Component } from "react";

import BarChart from "../../components/BarChart/BarChart";
import DoughnutChart from "../../components/DoughnutChart/DoughnutChart";
import LineChart from "../../components/LineChart/LineChart";
import "./StatsPage.scss";

export default class StatsPage extends Component {
  state = {};

  render() {
    if (!this.state.visible) {
      setTimeout(() => {
        this.setState({ visible: true });
      }, 1000);
      return <div />;
    }

    const { usernames, ips, countries } = this.props.data;

    return (
      <div className="Stats">
        <div className="Stats-top">
          <BarChart data={usernames} title={"Username frequency"} />
          <DoughnutChart data={countries} title={"Countries"} />
        </div>
        <div className="Stats-bottom">
          <LineChart data={ips} title={"Most common ips"} />
        </div>
      </div>
    );
  }
}
