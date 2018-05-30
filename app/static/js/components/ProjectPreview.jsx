import React from "react";

export default class ProjectPreview extends React.Component {

	constructor(props) {
    super(props);
    this.state = {};
    this.next = this.next.bind(this);
  }

  next() {
    console.log("getting triggered. next screen!");
  }

  render() {
    return (
      <div className="individual-project" onClick={this.next}>
        {/* <img src={this.props.src} alt="project preview" /> */}
        <div className="project-preview" />
        <h5> {this.props.desc} </h5>
      </div>
    );
  }
}
