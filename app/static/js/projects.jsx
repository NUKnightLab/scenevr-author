import React from "react";
import IndividualProject from './components/IndividualProject.jsx';

export default class Projects extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      projectData: [
        {
          "title": "Test", 
          "desc": "Shortened description and such will fo here, but will also get cut if there's too much text", 
          "date": "March 14th",
        },

        {
          "title": "Test", 
          "desc": "Shortened description and such will fo here, but will also get cut if there's too much text", 
          "date": "March 14th",
        },

        {
          "title": "Test", 
          "desc": "Shortened description and such will fo here, but will also get cut if there's too much text", 
          "date": "March 14th",
        }
      ],
    };

    this.newProject = this.newProject.bind(this);
  }

  newProject(){
    console.log("new project!");
  }

  render() {
    return (
      <div id="projects">
        <div id="header"> 
          <div> HEADER </div>
        </div>
        <div id="title"> 
          <div> PROJECTS </div>
        </div>
        <div id="project-container"> 
          {this.state.projectData.map(proj => (
            <IndividualProject title={proj.title} desc={proj.desc} date={proj.date} />
          ))}
        </div>
        <div id="new-project" onClick={this.newProject}> 
          <div> NEW PROJECT </div>
        </div>

        <style jsx> {` 
          #projects {
            display: grid;
            height: 100vh;
            grid-template-columns: 100%;
            grid-template-rows: 60px 90px auto 60px;
            font-family: "Avenir Next";
            font-weight: bold;
            text-align: center;
            overflow: hidden;
          }

          #header, #title, #new-project {
            display: table;
          }

          #header div, #title div, #new-project div {
            display: table-cell;
            vertical-align: middle;
          }

          #header {
            background-color: #b8d4ff;
            z-index: 2;
          }

          #title {
            background-color: #F2F2F2
          }

          #project-container {
            overflow-y: scroll;
          }

          #new-project {
            background-color: #54cf86;
            z-index: 2;
            color: white;
          }

        `}</style>
      </div>
    ); 
  }
}
