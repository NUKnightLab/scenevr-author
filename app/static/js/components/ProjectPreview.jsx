import React from "react";
import { Redirect } from 'react-router';


export default class ProjectPreview extends React.Component {

	constructor(props) {
    super(props);
    this.state = {
			redirect: false,
			projectId: this.props.projectId,
			order: this.props.order
		};
    this.next = this.next.bind(this);
  }

  next() {
    this.setState({redirect: true})
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
      <div className="individual-project" onClick={this.next}>

        <div className="project-preview">
					<img src={this.props.src} alt="project preview" />
				</div>
        <h5 id="scene-description"> {this.props.desc} </h5>
      </div>
    );
  }
}
