import React from "react";
import { Redirect } from 'react-router';

import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  arrayMove,
} from 'react-sortable-hoc';

import ProjectPreview from './components/ProjectPreview.jsx';


const SortableItem = SortableElement(({scene, projectId, updateOrder}) =>
  <div>
    <ProjectPreview key={scene.index} desc={scene.desc} thumbnail={scene.thumbnail} order={scene.order} projectId={projectId} updateOrder={updateOrder}/>
  </div>
);

const SortableList = SortableContainer(({scenes, projectId, updateOrder}) => {
  return (
    <div>
      {scenes.map((scene, index) => (
        <SortableItem key={`item-${index}`} index={index} scene={scene} projectId={projectId} updateOrder={updateOrder} />
      ))}
    </div>
  );
});

export default class CreateProject extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      projectId: this.props.location.state.projectId,
      redirectProjects: false,
      redirectUpload: false,
      scenes: [],
      numScenes: 0,
      embedUrl: null,
      showModal: false
    };

    this.goToProjects = this.goToProjects.bind(this);
    this.updateTitles = this.updateTitles.bind(this);
    this.updateOrder = this.updateOrder.bind(this);
    this.createScene = this.createScene.bind(this);
    this.publish = this.publish.bind(this);
    this.fetchScenes = this.fetchScenes.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  componentDidMount() {
    this.fetchScenes()
  }

  fetchScenes(){
    const url = "/project-details/" + this.state.projectId;
    fetch(url, {'credentials': 'include'})
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            scenes: result.scenesData,
            numScenes: result.scenesData.length
          });

          if (result.title){
            document.getElementById('title-input').value=result.title;
          } else{
            document.getElementById('title-input').placeholder="New Project Title...";
          };

          if (result.desc){
            document.getElementById('project-description').value=result.desc;
          } else{
            document.getElementById('project-description').placeholder="Write a description";
          };

        },
        
        (error) => {
          this.setState({error});
        }
      )
  }

  goToProjects(){
    this.setState({ redirectProjects: true });
  }

  createScene(){
    this.setState({
        redirectUpload: true
    });
  }

  updateTitles(){
    const url = "/project-details/" + this.state.projectId;
    var titleData = document.getElementById('title-input').value;
    var descData = document.getElementById('project-description').value;
    var data = {
      titleData: titleData,
      descData: descData,
      sceneData: this.state.scenes
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
        this.fetchScenes();
      },
      (error) => {
        this.setState({error});
      }
    )
  }

  createScene(){
    this.setState({
        redirectUpload: true
    });
  }

  publish(){
    const url = "/publish/" + this.state.projectId;
    var titleData = document.getElementById('title-input').value;
    var descData = document.getElementById('project-description').value;
    var data = {
      titleData: titleData,
      descData: descData,
      sceneData: this.state.scenes
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
        if (result.embed_url) {
          this.setState({ embedUrl: result['embed_url'], showModal: true })
        } else {
          console.log("No embed_url so skipping modal; result:");
          console.log(result)
        }
      },
      (error) => {
        this.setState({error});
      }
    )
  }

  onSortEnd({oldIndex, newIndex}) {
    const {scenes} = this.state;
    var tempScenes = arrayMove(scenes, oldIndex, newIndex);
    this.setState({
        scenes: tempScenes
    });
    this.updateOrder();
	}

  updateOrder(){
    const {scenes} = this.state;
    var tempScenes = this.state.scenes;
    for (let i = 0; i < scenes.length; i++){
      tempScenes[i].order = i;
    }
    this.setState({
        scenes: tempScenes
    });
    this.updateTitles();
  }

  closeModal(){
    this.setState({showModal: false})
  }


  render() {
    const { redirectProjects, redirectUpload, showModal, scenes } = this.state;

    if (redirectProjects){
      return (
        <Redirect to={{pathname: '/'}}/>
      );
    }

    if (redirectUpload){
      return (
        <Redirect to={{
          pathname: '/upload',
          state: {
              projectId: this.state.projectId,
              order: this.state.numScenes
            }
          }}/>
      );
    }

    let modal = null;

    if (showModal) {
      if (this.state.embedUrl) {
        modal = (
          <div>
            <div className="modal-overlay" id="modal-overlay"></div>
            <div className="modal" id="modal">
              <button className="close-button" id="close-button" onClick={this.closeModal}>X</button>
              <div className="modal-guts">
                <h1>Share</h1>
                <input type="text" value={this.state.embedUrl} readOnly />
                <a href={this.state.embedUrl} target="_blank">
                  <div id="preview-button"> Preview </div>
                </a>
              </div>
            </div>
          </div>
        );
      } else {
        console.warn('showModal is true but this.state.embedUrl is null. This should not be.')
      }
    }

    return (
      <div id="CreateProject">
        {modal}
        <div id="create-header">
          <h6 id="nav-title" className="link" onClick={this.goToProjects}> &lt; Your Projects </h6>
          <h6 id="publish" onClick={this.publish}> Share </h6>
        </div>
        <div id="create-project-content">
          <input id="title-input" type="text" onBlur={this.updateTitles}/>
          <input id="project-description" type="text" onBlur={this.updateTitles} />
          <div id="scenes-container">
            <SortableList scenes={scenes} updateOrder={this.updateOrder} projectId={this.state.projectId} onSortEnd={this.onSortEnd.bind(this)} useDragHandle={true}/>
            <div id="add-scene-button" onClick={this.createScene}>
              <div> + <h6> ADD NEW PHOTO </h6> </div>
            </div>
          </div>
        </div>
        <div id="create-footer"> <div> {this.state.numScenes} photos uploaded </div> </div>

      </div>
    );
  }
}
