import React, { Component } from "react";
import axios from "axios";
import "./App.scss";

import UploadPage from "./containers/UploadPage/UploadPage";
import StatsPage from "./containers/StatsPage/StatsPage";

class App extends Component {
  state = {};

  upload = (file) => {
    const data = new FormData();
    data.append("file", file);
    axios
      .post(`http://localhost:${window.port || 4000}/api/upload/`, data)
      .then((res) => {
        this.setState({
          usernames: res.data.usernames,
          ips: res.data.ips,
          countries: res.data.countries,
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
    const { usernames, countries, ips, error } = this.state;
    const appClass = usernames ? "App" : "App-centered";
    const logoClass = usernames ? "Logo-min" : "Logo";

    return (
      <div className={appClass}>
        <img className={logoClass} src="logo.png" alt="Logo" />
        {this.state.usernames && (
          <StatsPage
            upload={this.upload}
            data={{ usernames, countries, ips }}
          />
        )}
        {!this.state.usernames && error && (
          <h2 children="Something went wrong" />
        )}
        {!this.state.usernames && !error && <UploadPage upload={this.upload} />}
      </div>
    );
  }
}

export default App;
