import React, { Component } from "react";
import axios from "axios";

import BarChart from "./components/BarChart/BarChart";
import DoughnutChart from "./components/DoughnutChart/DoughnutChart";
import "./App.scss";

class App extends Component {
  state = {
    usernames: [],
    ips: [],
    countries: [],
    selectedFile: null,
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

    axios.post("/api/graphs/upload", data).then((res) => {
      this.setState({
        usernames: res.data.usernames,
        ips: res.data.ips,
        countries: res.data.countries
      });
    });
  };

  render() {
    const { usernames, ips, countries } = this.state;

    return (
      <div className="App">
        <div className="Title"> Logalyzer </div>
        <div className="Charts">
          <div className="Charts_usernames">
            <BarChart data={usernames} title={"Username frequency"} />
          </div>
          <div className="Charts_ips">
            <DoughnutChart data={ips} title={"Most common ips"} />
          </div>
          <div className="Charts_countries">
            <DoughnutChart data={countries} title={"Countries"} />
          </div>
        </div>
        <div className="Upload">
          <input type="file" onChange={this.onChangeHandler} />
          <button type="button" onClick={this.onClickHandler}>
            Upload
          </button>
        </div>
      </div>
    );
  }
}

export default App;
