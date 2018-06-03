import React from "react";
import { Redirect } from 'react-router';

import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  arrayMove,
} from 'react-sortable-hoc';

import ProjectPreview from './components/ProjectPreview.jsx';

const DragHandle = SortableHandle(() => <span>::</span>);

const SortableItem = SortableElement(({scene}) =>
  <ProjectPreview key={scene.index} desc={scene.desc} />
);

const SortableList = SortableContainer(({scenes}) => {
  return (
    <div>
      {scenes.map((scene, index) => (
        <SortableItem key={`item-${index}`} index={index} scene={scene} />
      ))}
    </div>
  );
});

export default class CreateProject extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      projectId: this.props.location.state.project_id,
      redirectProjects: false,
      numScenes: 4,
      scenes: [
        {
          "order": 0,
          "src": "",
          "desc": "a really beautiful place i went to lolz",
        },

        {
          "order": 1,
          "src": "",
          "desc": "a really",
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

  onSortEnd({oldIndex, newIndex}) {
    const {scenes} = this.state;
    var tempScenes = arrayMove(scenes, oldIndex, newIndex);
    for (let i = 0; i < scenes.length; i++){
      tempScenes[i].order = i;
    }
    this.setState({
        scenes: tempScenes
    });
	}


  render() {
    const { redirectProjects, scenes } = this.state;

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
            <SortableList scenes={scenes} onSortEnd={this.onSortEnd.bind(this)}/>
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
