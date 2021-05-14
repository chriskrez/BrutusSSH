import React, { Component } from "react";
import axios from "axios";

import BarChart from "../../components/BarChart/BarChart";
import DoughnutChart from "../../components/DoughnutChart/DoughnutChart";
import LineChart from "../../components/LineChart/LineChart";
import "./StatsPage.scss";

export default class StatsPage extends Component {
  state = {
    countries: [],
  };

  fetchCountries = (ips) => {
    axios
      .post(
        `http://localhost:${window.port || 4000}/api/upload/fetch_countries`,
        ips
      )
      .then((res) => {
        this.setState({
          countries: res.data.countries,
          error: res.data.error,
        });
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          error,
        });
      });
  };

  onChangeHandler = (event) => {
    this.setState({
      countries: [],
    });

    const file = event.target.files[0];
    if (file) {
      this.props.upload(file);
    }
  };

  renderTableHeader = () => {
    let header = Object.keys(this.props.data.success[0]);
    return header.map((key, index) => {
      return <th key={index}>{key.toUpperCase()}</th>;
    });
  };

  renderTableData = () => {
    return this.props.data.success.map((s, index) => {
      const { date, method, username, ip } = s;
      return (
        <tr key={index + 1}>
          <td>{date}</td>
          <td>{method}</td>
          <td>{username}</td>
          <td>{ip}</td>
        </tr>
      );
    });
  };

  render() {
    if (!this.state.visible) {
      setTimeout(() => {
        this.setState({ visible: true });
      }, 1000);
      return <div />;
    }

    const {
      usernames,
      ips,
      countedIps,
      hours,
      attempts,
      dateRange,
      tfattempts,
    } = this.props.data;

    const countries = this.state.countries;

    return (
      <div>
        <div className="Stats">
          <h3> Information for Failed Login Attempts </h3>
          <p>
            Total failed login attempts: <strong>{attempts} </strong>{" "}
            {dateRange[0].localeCompare(dateRange[1])
              ? `from ${dateRange[0]} to ${dateRange[1]}`
              : `for ${dateRange[0]}`}
          </p>
          <p>
            Todays failed login attempts: <strong>{tfattempts}</strong>
          </p>
          <span>
            <div className="Stats-chart">
              <BarChart data={usernames} title={"Username frequency"} />
            </div>
            <div className="Stats-chart">
              <LineChart data={ips} title={"Most common ips"} />
            </div>
          </span>
          <span>
            <div className="Stats-chart">
              <DoughnutChart data={countries} title={"Countries"} />
              <button
                children="Fetch countries"
                onClick={() => this.fetchCountries(countedIps)}
              />
            </div>
            <div className="Stats-chart">
              <BarChart data={hours} title={"Hours"} />
            </div>
          </span>
          <h3> Information for Successful Login Attempts </h3>
          {this.props.data.success.length === 0 ? (
            <p> No successful logins were recorded </p>
          ) : (
            <table id="successful-logins">
              <tbody>
                <tr>{this.renderTableHeader()}</tr>
                {this.renderTableData()}
              </tbody>
            </table>
          )}
        </div>
        <button children="Reupload File" onClick={() => this.input.click()} />
        <input
          type="file"
          accept=".txt, .log"
          ref={(input) => (this.input = input)}
          onChange={this.onChangeHandler}
        />
      </div>
    );
  }
}
