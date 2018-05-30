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
        <div id="create-header">
          <h6 id="nav-title"> &lt; Your Projects </h6>
          <h6 id="publish"> Publish </h6>
        </div>

        <div id="create-project-content">
          <input id="title-input" type="text" placeholder="New Project Title..." />
          <input id="project-description" type="text" placeholder="Write a description" />
          <div id="scenes-container">
            {this.state.scenes.map(scene =>
              <ProjectPreview desc={scene.desc} />
            )}

            <div id="add-scene-button">
              <div> + </div>
            </div>
          </div>
        </div>
        <div id="create-footer"> <div> {this.state.numScenes} scenes uploaded </div> </div>

      </div>
    );
  }
}
