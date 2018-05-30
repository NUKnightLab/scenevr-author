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

        <style jsx> {` 
          #individual-project {
          	margin: 0 8px;
          	display: grid;
          	grid-template-columns: 5fr 4fr;
          	grid-gap: 10px;
          	font-family: "Avenir Next";
          	width: 97%;
           	border-bottom: 1px solid #999;
          }

          #name {
          	font-weight: bold;
          }

          #desc {
          	font-size: 1.1rem;
          }

          #project-info {
          	grid-column: 1;
          	padding: 10px;
          	padding-top: 20px;
          }

          #project-thumbnail {
          	background-color: #B0B0B0;
          	border-radius: 5px;
          	height: 80%;
          	margin-top: 10%;
          	grid-column: 2;
          	margin-right: 10px;
          }
        `}</style>
      </div>
    ); 
  }
}
