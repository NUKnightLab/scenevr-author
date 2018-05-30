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
        
        <style jsx> {` 

          #CreateProject {
            font-family: "Avenir Next";
          }

          #CreateProject input {
            outline: none;
            border: none;
          }

          #upload-header1 {
            background-color: #333;
            height: 60px;
            z-index: 2;
          }

          #upload-content {
            display: grid;
            grid-template-rows: 50px auto;
            grid-template-columns: 1fr 2fr;
            height: calc(100vh - 60px);
            position: relative;
          }

          #upload-cancel, #upload-done {
            position: absolute;
            top: 15px;
            color: #7ACCFF;
          }

          #upload-cancel {
            grid-column: 1;
            left: 15px;
          }

          #upload-done {
            grid-column: 2;
            right: 20px;
          }

          #upload-text {
            text-align: center;
            position: relative;
            top: 13px;
            font-weight: bold;
            font-size: 1.2rem;
          }

          #upload-header2 {
            grid-column: 1 / 3;
            padding-bottom: 10px;
            border-bottom: 2px solid #ddd;
          }

          #upload-thumbnail {
            background-color: #B0B0B0;
            margin: 17px;
            height: 100px;
            width: 140px;
            border-radius: 6px;
            display: inline-block;
          }

          #upload-description {
            margin: 17px;
            height: 100px;
            color: #444;
            word-break: break-all;
          }

        `}</style>
      </div>
    ); 
  }
}
