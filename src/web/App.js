import React, { Component } from "react";
import "./App.scss";

import SSHPage from "./containers/SSHPage/SSHPage";

class App extends Component {
  render() {
    return (
      <div className="App">
        <img src="logo.png" alt="Logo" />
        <SSHPage />
      </div>
    );
  }
}

export default App;
