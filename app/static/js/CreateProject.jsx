import React from "react";
import { Redirect } from 'react-router';

import IndividualProject from './components/IndividualProject.jsx';
import ProjectPreview from './components/ProjectPreview.jsx';

export default class CreateProject extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      projectId: this.props.location.state.project_id,
      projectTitle: this.props.location.state.project_title,
      projectDesc: this.props.location.state.project_desc,
      redirectProjects: false,
      numScenes: 4,
      scenes: [
        {
          "index": 0,
          "src": "",
          "desc": "a really beautiful place i went to lolz",
        },

        {
          "index": 1,
          "src": "",
          "desc": "a really beautiful place i went to lolz",
        },
      ],
    };

    this.addProject = this.addProject.bind(this);
    this.goToProjects = this.goToProjects.bind(this);
    this.updateTitles = this.updateTitles.bind(this);
  }

  componentDidMount() {
    const url = "/project-details/" + this.state.projectId;
    fetch(url, {'credentials': 'include'})
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            projectTitle: result.title,
            projectDesc: result.desc
          });

          if (result.title){
            document.getElementById('title-input').value=result.title;
          } else{
            document.getElementById('title-input').placeholder="New Project Title...";
          };

          if (result.desc){
            document.getElementById('project-description').value=result.desc;
          } else{
            document.getElementById('title-input').placeholder="Write a description";
          };
          
        },
        (error) => {
          this.setState({error});
        }
      )
  }

  addProject(){
    const oldState = this.state.projects;
  }

  goToProjects(){
    this.setState({ redirectProjects: true });
  }

  updateTitles(){
    const url = "/project-details/" + this.state.projectId;
    var titleData = document.getElementById('title-input').value;
    var descData = document.getElementById('project-description').value;
    var data = {
      titleData: titleData,
      descData: descData
    };
    fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers:{
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    .then(res => res.json())
    .then(
      (result) => {
        console.log(result);
      },
      (error) => {
        this.setState({error});
      }
    )
  }

  render() {
    const { redirectProjects } = this.state;

    if (redirectProjects){
      return (
        <Redirect to={{pathname: '/'}}/>
      );
    }

    return (
      <div id="CreateProject">
        <div id="create-header">
          <h6 id="nav-title" className="link" onClick={this.goToProjects}> &lt; Your Projects </h6>
          <h6 id="publish"> Publish </h6>
        </div>

        <div id="create-project-content">
          <input id="title-input" type="text" onBlur={this.updateTitles}/>
          <input id="project-description" type="text" onBlur={this.updateTitles} />
          <div id="scenes-container">
            {this.state.scenes.map(scene =>
              <ProjectPreview key={scene.index} desc={scene.desc} />
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
