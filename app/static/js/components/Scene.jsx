import React from "react";
import { Redirect } from 'react-router';
import {SortableHandle,} from 'react-sortable-hoc';

const DragHandle = SortableHandle(() => <div id="drag-handle">&#9776;</div>);

export default class Scene extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            order: this.props.order
        };
        this.next = this.next.bind(this);
        this.deleteScene = this.deleteScene.bind(this);
    }

    next() {
        this.setState({redirect: true})
    }

    deleteScene() {
        const url = "/delete-scene/" + this.props.projectId;
        let uuid_to_delete = this.state.uuid;
        let updateProjectState = this.props.updateProjectState;
        var data = {
            sceneUUID: this.state.uuid
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
                try {
                    if (result.error) {
                        this.props.errorCallback(result.error)
                    } else {
                        updateProjectState(result);
                    }
                } catch(error) {
                    console.error('deleteScene error')
                    console.error(error);
                    this.props.errorCallback(error);

                }
            },
            (error) => {
                console.log(`Error deleting image: ${error}`)
                this.props.errorCallback(error);
            }
        )
    }

    render() {
        const { redirect } = this.state;
        let scene_caption = this.props.caption;
        if (scene_caption) {
            scene_caption = (<p id="scene-caption"> {scene_caption}</p>)
        }
        if (redirect){
        	return (
        		<Redirect to={{
        			pathname: '/upload',
        			state: {
        				projectId: this.props.projectId,
        				order: this.state.order,
                        edit: true
        			}
        		}}/>
        	);
        }

        return (
            <div className="listed-images" >

                <DragHandle />

                <div className="scene-preview" onClick={()=>{this.props.editCallback(this.props.uuid)}}>
                    <img src={this.props.thumbnail} alt={this.props.caption} />
                    {scene_caption}
                </div>

                <div id="delete-scene" onClick={this.deleteScene}>
                    <span className="icon-bin"></span>
                </div>

            </div>
        );
    }
}
