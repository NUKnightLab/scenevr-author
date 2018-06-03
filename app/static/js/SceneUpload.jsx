import React from "react";
import { Redirect } from 'react-router';

import IndividualProject from './components/IndividualProject.jsx';
import ProjectPreview from './components/ProjectPreview.jsx';

export default class SceneUpload extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      file: '',
      imagePreviewUrl: '',
      projectId: this.props.location.state.projectId,
      redirect: false,
    };

    this.fileChangedHandler = this.fileChangedHandler.bind(this);
    this.upload = this.upload.bind(this);
    this.cancel = this.cancel.bind(this);

  }

  fileChangedHandler(event){
    let reader = new FileReader();
    let file = event.target.files[0];
    reader.onloadend = () => {
      this.setState({
        file: file,
        imagePreviewUrl: reader.result
      });
    }

    reader.readAsDataURL(file)
  }

  upload(){

  }

  cancel(){
    this.setState({redirect: true});
  }


  render() {
    let {imagePreviewUrl, redirect} = this.state;
    let imagePreview = null;

    if (imagePreviewUrl) {
      imagePreview = (<img src={imagePreviewUrl} />);
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
            <h6 id="upload-done" onClick={this.upload}> Publish </h6>
          </div>

          <div id="upload-thumbnail">
            {imagePreview}
          </div>

          <div id="upload-description">
            <input type="text" placeholder="Write a description" />
          </div>

          <input type="file" onChange={this.fileChangedHandler} />


        </div>

      </div>
    );
  }
}
