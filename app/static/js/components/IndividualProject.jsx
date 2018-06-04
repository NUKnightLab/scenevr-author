import React from "react";
import { Redirect } from 'react-router';

export default class IndividualProject extends React.Component {

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
	      <div id="individual-project" className="link" onClick={this.editProject}>
	      	<div id="project-info">
		      	<h4 id="name"> {this.props.title} </h4>
		        <h5 id="desc"> {this.props.desc} </h5>
		        <p id="date"> {this.props.date} </p>
	      	</div>
	        <div id="project-thumbnail">
						{imageThumbnail}
	        </div>
	      </div>
	    );
		}
  }
}
