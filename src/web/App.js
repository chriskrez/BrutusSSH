import React, { Component } from "react";
import axios from "axios";

import BarChart from "./components/BarChart/BarChart";
import DoughnutChart from "./components/DoughnutChart/DoughnutChart";
import "./App.scss";

class App extends Component {
  state = {
    usernames: [],
    ips: [],
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
      });
    });
  };

  render() {
    const { usernames, ips } = this.state;

    return (
      <div className="App">
        <div className="Upload">
          <input type="file" onChange={this.onChangeHandler} />
          <button type="button" onClick={this.onClickHandler}>
            Upload
          </button>
        </div>
        <div className="Charts">
          <div className="ChartsBar">
            <BarChart data={usernames} title={"Username frequency"} />
          </div>
          <div className="ChartsDoughnut">
            <DoughnutChart data={ips} title={"Most common ips"} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
