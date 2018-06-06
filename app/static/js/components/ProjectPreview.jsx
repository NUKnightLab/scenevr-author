import React from "react";
import { Redirect } from 'react-router';
import {
  SortableHandle,
} from 'react-sortable-hoc';

const DragHandle = SortableHandle(() => <span id="drag-handle">&#9776;</span>);

export default class ProjectPreview extends React.Component {

	constructor(props) {
    super(props);
    this.state = {
			redirect: false,
			projectId: this.props.projectId,
			order: this.props.order
		};
    this.next = this.next.bind(this);
		this.deleteScene = this.deleteScene.bind(this);
  }

  next() {
    this.setState({redirect: true})
  }

	deleteScene() {
		const url = "/delete-scene/" + this.state.projectId;
    var data = {
      sceneOrder: this.state.order
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
				this.props.updateOrder();
      },
      (error) => {
        this.setState({error});
      }
    )
	}

  render() {
		const {redirect} = this.state;

		if (redirect){
			return (
				<Redirect to={{
					pathname: '/upload',
					state: {
							projectId: this.state.projectId,
							order: this.state.order
						}
					}}/>
			);
		}

    return (
<<<<<<< HEAD
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
=======
      <div className="individual-project" >

				<DragHandle />

        <div className="project-preview" onClick={this.next}>
					<img src={this.props.src} alt="project preview" />
					<h5 id="scene-description"> {this.props.desc} </h5>
				</div>

				<div id="delete-scene" onClick={this.deleteScene}>
					<img src="/static/images/trash.svg"/>
				</div>

>>>>>>> fedb8f06033b7844cf8de0937f3d9071d8bfe31b
      </div>
    );
  }
}
