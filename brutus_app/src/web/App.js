import React, { Component } from "react";
import { ActivityIndicator } from "react-native";
import axios from "axios";
import "./App.scss";

import UploadPage from "./containers/UploadPage/UploadPage";
import StatsPage from "./containers/StatsPage/StatsPage";

class App extends Component {
  state = {
    isLoading: false,
  };

  upload = (file) => {
    this.setState({ isLoading: true });
    const data = new FormData();
    data.append("file", file);
    axios
      .post(`http://localhost:${window.port || 4000}/api/upload/`, data)
      .then((res) => {
        this.setState({
          usernames: res.data.usernames,
          ips: res.data.ips,
          countries: res.data.countries,
          hours: res.data.hours,
          error: res.data.error,
          attempts: res.data.attempts,
          success: res.data.success,
          dateRange: res.data.dateRange,
          tfattempts: res.data.tfattempts,
          isLoading: false,
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          error: true,
        });
      });
  };

  render() {
    const {
      usernames,
      countries,
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
        {this.state.usernames && (
          <StatsPage
            upload={this.upload}
            data={{
              usernames,
              countries,
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
            <h2 children="Something went wrong" />
          </div>
        )}
        {!this.state.usernames && !error && !this.state.isLoading && (
          <UploadPage upload={this.upload} />
        )}
        {this.state.isLoading && (
          <ActivityIndicator size="large" color={"#000066"} />
        )}
      </div>
    );
  }
}

export default App;
