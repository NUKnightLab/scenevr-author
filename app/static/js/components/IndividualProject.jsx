import React from "react";

export default class IndividualProject extends React.Component {

	constructor(props) {
    super(props);
    this.state = {};
  }

  newProject() {
  	console.log("next project upload screen appears");
  }

  render() {
    return (
      <div id="individual-project">
      	<div id="project-info">
	      	<h4 id="name"> {this.props.title} </h4>
	        <h5 id="desc"> {this.props.desc} </h5>
	        <p id="date"> {this.props.date} </p>
      	</div>
        <div id="project-thumbnail"> 
        </div>
      </div>
    );
  }
}
