import React from "react";
import { Redirect } from 'react-router';

export default class IndividualProject extends React.Component {

	constructor(props) {
    super(props);
    this.state = {
			redirect: false
		};
		this.editProject = this.editProject.bind(this);
  }

  editProject() {
  	this.setState({ redirect: true });
  }

  render() {
		const { redirect } = this.state;
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
	        </div>
	      </div>
	    );
		}
  }
}
