import React, { Component } from "react";
import "./UploadPage.scss";

class UploadPage extends Component {
  onChangeHandler = (event) => {
    const file = event.target.files[0];
    if (file) {
      this.props.upload(file.path);
    }
  };

  render() {
    return (
      <div className="Upload">
        <h1>Upload your SSH log file!</h1>
        <button children="Choose file" onClick={() => this.input.click()} />
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

export default UploadPage;
