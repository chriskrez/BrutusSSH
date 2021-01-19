import React, { Component } from "react";
import axios from "axios";

import BarChart from "../../components/BarChart/BarChart";
import DoughnutChart from "../../components/DoughnutChart/DoughnutChart";
import LineChart from "../../components/LineChart/LineChart";
import "./SSHPage.scss";

export default class SSHPage extends Component {
  state = {
    countries: [],
    ips: [],
    selectedFile: null,
    usernames: [],
  };

  onChangeHandler = (event) => {
    var file = event.target.files[0];
    this.setState({
      selectedFile: file,
    });
  };

  onClickHandler = () => {
    const data = new FormData();
    data.append("file", this.state.selectedFile);
    axios
      .post(`http://localhost:${window.port}/api/upload/`, data)
      .then((res) => {
        this.setState({
          usernames: res.data.usernames,
          ips: res.data.ips,
          countries: res.data.countries,
        });
      });
  };

  render() {
    const { usernames, ips, countries } = this.state;

    return (
      <div className="Stats">
        <div className="Upload">
          <text>Upload your SSH log file!</text>
          <input type="file" onChange={this.onChangeHandler} />
          <button type="button" onClick={this.onClickHandler}>
            Upload
          </button>
        </div>
        <div className="Charts">
          <div className="Charts_top">
            <BarChart data={usernames} title={"Username frequency"} />
            <DoughnutChart data={countries} title={"Countries"} />
          </div>
          <div className="Charts_bottom">
            <LineChart data={ips} title={"Most common ips"} />
          </div>
        </div>
      </div>
    );
  }
}
