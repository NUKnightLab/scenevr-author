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
        let scene_description = this.props.desc;
        if (scene_description) {
            scene_description = (<p id="scene-description"> {scene_description} </p>)
        }
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
            <div className="listed-images" >

                <DragHandle />

                <div className="project-preview" onClick={this.next}>
                    <img src={this.props.thumbnail} alt={this.props.desc} />
                    {scene_description}
                </div>

                <div id="delete-scene" onClick={this.deleteScene}>
                    <span className="icon-bin"></span>
                </div>

            </div>
        );
    }
}
