import React from "react";
import IndividualProject from './components/IndividualProject.jsx';
import ProjectPreview from './components/ProjectPreview.jsx';

export default class CreateProject extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      projectTitle: "",
      projectDesc: "",
      numScenes: 4,
      scenes: [
        {
          "index": 0,
          "src": "", 
          "desc": "a really beautiful place i went to lolz", 
        },

        {
          "index": 0,
          "src": "", 
          "desc": "a really beautiful place i went to lolz", 
        },

        {
          "index": 0,
          "src": "", 
          "desc": "a really beautiful place i went to lolz", 
        },

        {
          "index": 0,
          "src": "", 
          "desc": "a really beautiful place i went to lolz", 
        },
      ],
    };

    this.addProject = this.addProject.bind(this);
  }

  addProject(){
    const oldState = this.state.projects;

  }

  render() {
    return (
      <div id="CreateProject">
        <div id="create-header"> </div>
        <div id="create-project-content"> 
          <input id="title-input" type="text" placeholder="New Project Title..." />
          <input id="project-description" type="text" placeholder="Write a description" />
          <div id="scenes-container">
            {this.state.scenes.map(scene => 
              <ProjectPreview desc={scene.desc} />
            )}
          </div>
        </div>
        <div id="create-footer"> <div> {this.state.numScenes} scenes uploaded </div> </div>

        <style jsx> {` 

          #create-header {
            background-color: #555555;
            z-index: 2;
          }

          #CreateProject {
            display: grid;
            height: 100vh;
            grid-template-columns: 100%;
            grid-template-rows: 60px auto 60px;
            font-family: "Avenir Next";
            font-weight: bold;
            text-align: center;
            overflow: hidden;
          }

          #create-project-content {
            overflow-y: scroll;
          }
          
          #title-input {
            color: #8F8F8F;
            font-size: 2rem;
            font-weight: bold;
            margin-top: 30px;
          }

          #project-description {
            font-weight: 200;
            color: #979797;
          }

          #title-input, #project-description {
            margin-left: 10%;
            border: none;
          }

          #create-footer {
            display: table;
          }

          #create-footer div {
            display: table-cell;
            vertical-align: middle;
            font-weight: 100;
            color: #3e3e3e;
          }

        `}</style>
      </div>
    ); 
  }
}
