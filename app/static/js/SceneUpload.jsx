import React from "react";
import IndividualProject from './components/IndividualProject.jsx';
import ProjectPreview from './components/ProjectPreview.jsx';

export default class SceneUpload extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      src: "",
    };

    this.addProject = this.addProject.bind(this);
  }

  addProject(){
   console.log("trigger upload element");
  }

  render() {
    return (
      <div id="CreateProject">
        <div id="upload-header1">
        </div>

        <div id="upload-content">
          <div id="upload-header2">
            <h6 id="upload-cancel"> Cancel </h6>
            <h6 id="upload-text"> Upload New Scene </h6>
            <h6 id="upload-done"> Publish </h6>
          </div>

          <div id="upload-thumbnail"> </div>
          <div id="upload-description">
            <input type="text" placeholder="Write a description" />
          </div>

        </div>
        
      </div>
    );
  }
}
