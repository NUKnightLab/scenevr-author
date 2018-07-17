import React from "react";
import { Redirect } from 'react-router';

export default class ListedProject extends React.Component {

	constructor(props) {
    super(props);
    this.state = {
			redirect: false,
			thumbnail: this.props.thumbnail
		};
		this.editProject = this.editProject.bind(this);
  }

  editProject() {
  	this.setState({ redirect: true });
  }

  render() {
		const { redirect } = this.state;
		let imageThumbnail = null;

		if (this.state.thumbnail) {
			imageThumbnail = (<img src={this.state.thumbnail} />);
		} else {
			imageThumbnail = (<div />);
		}
        let proj_title = this.props.title;
        if (!proj_title) {
            proj_title = (<span className="untitled">Untitled</span>)
        }
		if (redirect){
	      return (
					<Redirect to={{
	          pathname: '/create',
	          state: {
								projectId: this.props.id,
							}
	      		}}/>
				);
		}
		else {
    	    return (
                <div id="listed-project">
                    <div id="project-thumbnail" onClick={this.editProject}>
                        {imageThumbnail}
                    </div>
                    <div id="project-info">
                        <h4 id="name"> {proj_title} </h4>
                        <p id="desc"> {this.props.desc} </p>
                        <p id="date"> {this.props.date} </p>
                    </div>

                </div>
    	    );
		}
  }
}
