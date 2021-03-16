import React, { Component } from "react";

import BarChart from "../../components/BarChart/BarChart";
import DoughnutChart from "../../components/DoughnutChart/DoughnutChart";
import LineChart from "../../components/LineChart/LineChart";
import "./StatsPage.scss";

export default class StatsPage extends Component {
  state = {};
  onChangeHandler = (event) => {
    const file = event.target.files[0];
    if (file) {
      this.props.upload(file);
    }
  };

  render() {
    if (!this.state.visible) {
      setTimeout(() => {
        this.setState({ visible: true });
      }, 1000);
      return <div />;
    }

    const { usernames, ips, countries } = this.props.data;

    return (
      <div>
        <div className="Stats">
          <BarChart data={usernames} title={"Username frequency"} />
          <DoughnutChart data={countries} title={"Countries"} />
          <LineChart data={ips} title={"Most common ips"} />
        </div>
        <button children="Reupload File" onClick={() => this.input.click()} />
        <input
          type="file"
          ref={(input) => (this.input = input)}
          onChange={this.onChangeHandler}
        />
      </div>
    );
  }
}
