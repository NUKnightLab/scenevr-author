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
      shareModal: false,
      scenes: [
        {
          "index": 0,
          "src": "", 
          "desc": "a really beautiful place i went to lolz", 
        },

        {
          "index": 0,
          "src": "", 
          "desc": "second, here's a scene that illlustrates how awesome my family is", 
        },
      ],
    };

    this.addProject = this.addProject.bind(this);
    this.share = this.share.bind(this);
    this.hideShare = this.hideShare.bind(this);
  }

  componentDidMount() {
    this.hideShare();
  }

  addProject(){
    const oldState = this.state.projects;
  }

  hideShare(){
    document.getElementById("shareModal-bkg").style.display = "none";
    document.getElementById("shareModal").style.display = "none";
  }

  share() {
    document.getElementById("shareModal-bkg").style.display = "block";
    document.getElementById("shareModal").style.display = "block";
  }

  render() {
    return (
      <div id="CreateProject">
        <div id="create-header"> 
          <h6 id="nav-title"> &lt; Your Projects </h6>
          <h6 id="publish" onClick={this.share}> Share </h6>
        </div>
        
        <div id="create-project-content"> 
          <div id="shareModal-bkg" onClick={this.hideShare}> </div>
          <div id="shareModal">
              <h4> Share Project </h4>
              <input type="text" placeholder="https://www.blahblah.com/jimmytwoshoes" />
              <h6 id="copyLink1"> Copy link </h6>
              <input type="text" placeholder="https://www.omg.com/thisisgosha" />
              <h6> Copy link </h6>
          </div>
          <input id="title-input" type="text" placeholder="Untitled" />
          <input id="project-description" type="text" placeholder="Write a description" />
          <div id="scenes-container">
            {this.state.scenes.map(scene => 
              <ProjectPreview desc={scene.desc} />
            )}

            <div id="add-scene-button"> 
              <div> + <h6> ADD NEW PHOTO </h6> </div>
            </div>
          </div>
        </div>
        <div id="create-footer"> <div> {this.state.numScenes} photos uploaded </div> </div>

        <style jsx> {` 

          #create-header {
            background-color: #555555;
            z-index: 2;
            display: grid;
            grid-template-columns: 1fr 1fr;
            color: white;
            font-weight: 100;
            font-size: .8rem;
          }

          #shareModal-bkg {
            background-color: #fff;
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            width: 100%;
            opacity: .8;
            z-index: 3;
          }

          #shareModal {
            margin: 0 auto;
            height: 50%;
            position: fixed;
            top: 25%;
            left: 5%;
            width: 90%;
            border-radius: 6px;
            background-color: #eee;
            opacity: 1;
            z-index: 4;
          }

          #shareModal input {
            display: block;
            margin: 0 auto;
            width: 90%;
            margin: 20px;
          }

          #shareModal h4 {
            margin-top: 25px;
            margin-bottom: 50px;
          }

          #shareModal h6 {
            text-align: left;
            padding-left: 6%;
            color: #3db4ff;
          }

          #copyLink1 {
            margin-bottom: 40px;
          }

          #nav-title, #publish {
            position: absolute;
            top: 20px;
          }

          #nav-title {
            grid-column: 1;
            left: 20px;
          }

          #publish {
            grid-column: 2;
            color: #7accff;
            right: 20px;
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
            border: none;
            text-align: center;
          }

          #add-scene-button {
            width: 80%;
            height: 150px;
            display: block;
            margin: 50px auto;
            background-color: #D8D8D8;
            border-radius: 5px;
            font-size: 3rem;
          }

          #add-scene-button h6 {
            font-weight: bold;
            color: #808080;
          }

          #create-footer, #add-scene-button {
            display: table;
          }

          #create-footer div, #add-scene-button div {
            display: table-cell;
            vertical-align: middle;
            font-weight: 100;
            color: #3e3e3e;
          }

          #add-scene-button div {
            font-weight: bold;
          }

          ::-webkit-input-placeholder {
             text-align: center;
          }

          :-moz-placeholder { /* Firefox 18- */
             text-align: center;  
          }

          ::-moz-placeholder {  /* Firefox 19+ */
             text-align: center;  
          }

          :-ms-input-placeholder {  
             text-align: center; 
          }

        `}</style>
      </div>
    ); 
  }
}
