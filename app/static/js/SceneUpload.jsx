import React from "react";
import { Redirect } from 'react-router';

import ListedProject from './components/ListedProject.jsx';

export default class SceneUpload extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      file: '',
      scene_thumbnail: '',
      sceneId: '',
      projectId: this.props.location.state.projectId,
      order: this.props.location.state.order,
      redirect: false,
    };

    this.fileChangedHandler = this.fileChangedHandler.bind(this);
    this.upload = this.upload.bind(this);
    this.cancel = this.cancel.bind(this);

  }

    componentDidMount() {
      const url = "/upload-image/" + this.state.projectId + "/" + this.state.order;
      fetch(url, {'credentials': 'include'})
        .then(res => res.json())
        .then(
          (result) => {
            if (result.scene_exists == 'True'){
              this.setState({
                scene_thumbnail: result.scene_thumbnail,
                sceneId: result.scene_id
              });
              document.getElementById('description-input').value = result.desc;
            }
          },
          (error) => {
            this.setState({error});
          }
        )
    }


  fileChangedHandler(event){
    let reader = new FileReader();
    let file = event.target.files[0];
    reader.onloadend = () => {
      this.setState({
        file: file,
        scene_thumbnail: reader.result
      });
    }

    reader.readAsDataURL(file)
  }

  upload(){

    const url = "/upload-image/" + this.state.projectId + "/" + this.state.order;

    var caption = document.getElementById('description-input').value;
    var fileField = document.getElementById('file-object');
    var formData = new FormData();

    formData.append('order', this.state.order);
    formData.append('file', fileField.files[0]);
    formData.append('caption', caption);
    formData.append('sceneId', this.state.sceneId);

    fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })
    .then(res => res.json())
    .then(
      (result) => {
        this.setState({redirect: true});
      },
      (error) => {
        this.setState({error});
      }
    )


  }

  cancel(){
    this.setState({redirect: true});
  }


  render() {
    let { scene_thumbnail, redirect} = this.state;
    let imagePreview = null;

    if (scene_thumbnail) {
      imagePreview = (<img src={scene_thumbnail} />);
    } else {
      imagePreview = (<div id="upload-placeholder"></div>);
    }

    if(redirect){
      return (
        <Redirect to={{
          pathname: '/create',
          state: {
              projectId: this.state.projectId,
            }
          }}/>
      );
    }


    return (
      <div id="CreateProject">
        <div id="upload-header1">
        </div>

        <div id="upload-content">
          <div id="upload-header2">
            <h6 id="upload-cancel" onClick={this.cancel}> Cancel </h6>
            <h6 id="upload-text"> Upload New Scene </h6>
            <h6 id="upload-done" onClick={this.upload}> Upload </h6>
          </div>

          <div id="upload-thumbnail">
            {imagePreview}
          </div>

          <div id="upload-description">
            <input id="description-input" type="text" placeholder="Write a description" />
          </div>

          <input id="file-object" type="file" onChange={this.fileChangedHandler} />


        </div>

      </div>
    );
  }
}
