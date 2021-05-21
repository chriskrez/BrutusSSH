import React, { Component } from "react";
import Loader from "react-loader-spinner";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import axios from "axios";
import "./App.scss";

import UploadPage from "./containers/UploadPage/UploadPage";
import StatsPage from "./containers/StatsPage/StatsPage";

class App extends Component {
  state = {
    isLoading: false,
  };

  upload = (path) => {
    this.setState({ isLoading: true, path: path });
    const data = new FormData();
    data.append("path", path);

    axios
      .post(`http://localhost:${window.port || 4000}/api/upload/`, data)
      .then((res) => {
        this.setState({
          usernames: res.data.usernames,
          ips: res.data.ips,
          countedIps: res.data.countedIps,
          hours: res.data.hours,
          error: res.data.error,
          attempts: res.data.attempts,
          success: res.data.success,
          dateRange: res.data.dateRange,
          tfattempts: res.data.tfattempts,
          isLoading: false,
        });
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          error,
        });
      });
  };

  render() {
    const {
      usernames,
      countedIps,
      ips,
      hours,
      error,
      attempts,
      success,
      dateRange,
      tfattempts,
    } = this.state;

    const appClass = usernames ? "App" : "App-centered";
    const logoClass = usernames ? "Logo-min" : "Logo";

    return (
      <div className={appClass}>
        <img className={logoClass} src="logo.png" alt="Logo" />
        {this.state.isLoading && (
          <Loader
            type="Puff"
            color="#00BFFF"
            height={50}
            width={50}
            timeout={3000}
          />
        )}
        {this.state.usernames && (
          <StatsPage
            path={this.state.path}
            upload={this.upload}
            data={{
              usernames,
              countedIps,
              ips,
              hours,
              attempts,
              success,
              dateRange,
              tfattempts,
            }}
          />
        )}
        {!this.state.usernames && error && (
          <div>
            <UploadPage upload={this.upload} />
            <h2 children={this.state.error} />
          </div>
        )}
        {!this.state.usernames && !error && !this.state.isLoading && (
          <UploadPage upload={this.upload} />
        )}
      </div>
    );
  }
}

export default App;
