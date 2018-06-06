import React from "react";

export default class ProjectPreview extends React.Component {

	constructor(props) {
    super(props);
    this.state = {};
    this.next = this.next.bind(this);
  }

  next() {
    console.log("getting triggered. next screen!");
  }

  render() {
    return (
      <div className="individual-project" onClick={this.next}>
        {/* <img src={this.props.src} alt="project preview" /> */}
        <div className="project-preview" />
        <h5> {this.props.desc} </h5>
        <style jsx> {`
          .individual-project {
            height: 200px;
          }

          .project-preview {
            display: grid;
            grid-template-columns: 4fr 1fr;
            width: 90%;
            height: 150px;
            display: block;
            margin: 15px auto;
            background-color: #D8D8D8;
            border-radius: 5px;
          }

          .individual-project h5 {
            font-size: .8rem;
            color: #646464;
            text-align: left;
            padding-left: 25px;
            padding-top: 10px;
            width: 90%;
          }
        `}</style>
      </div>
    ); 
  }
}
