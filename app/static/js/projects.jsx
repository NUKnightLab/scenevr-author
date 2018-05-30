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
  }

  render() {
    return (
      <div id="projects">
        <div id="header"> HEADER </div>
        <div id="title"> TITLE </div>
        <div id="project-container"> 
          {this.state.projectData.map(proj => (
            <IndividualProject title={proj.title} desc={proj.desc} date={proj.date} />
          ))}
        </div>
        <div id="new-project" onClick={this.newProject}> NEW PROJECT </div>

        <style jsx> {` 
          #projects {
            display: grid;
            height: 100vh;
            grid-template-columns: 100%;
            grid-template-rows: 75px 100px auto 75px;
            font-family: "Avenir Next";
            font-weight: bold;
            text-align: center;
            overflow: hidden;
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
          }

        `}</style>
      </div>
    ); 
  }
}
