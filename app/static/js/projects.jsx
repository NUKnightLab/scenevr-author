import React from "react";
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Redirect } from 'react-router';

import IndividualProject from './components/IndividualProject.jsx';

export default class Projects extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      projectData: null,
      error: null,
      redirect: false,
      newProjectId: null
    };

    this.newProject = this.newProject.bind(this);
  }

  componentDidMount() {
    fetch("/projects", {'credentials': 'include'})
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            projectData: result
          });
        },
        (error) => {
          this.setState({error});
        }
      )
  }

  newProject(){
    var url = '/create-project';

    fetch(url, {
      method: 'POST',
      body: null,
      headers:{
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    .then(res => res.json())
    .then(
      (result) => {
        console.log(result);
        this.setState({
          redirect: true,
          newProjectId: result.project_id
        });
      },
      (error) => {
        this.setState({error});
      }
    )
  }

  render() {
    const { error, projectData, redirect } = this.state;
    if (redirect){
      return (
        <Redirect to={{
          pathname: '/create',
          state: {
              projectId: this.state.newProjectId
            }
          }}/>
      );
    }

    const projects = projectData ? (
      projectData.map(proj => (
        <IndividualProject key={proj.id} id={proj.id} title={proj.title} desc={proj.desc} date={proj.date} thumbnail={proj.thumbnail} />
      ))
    ) : (null);

    if (error){
      return <div>Error: {error.message}</div>;
    }
    else{
      return (
        <div id="projects">
          <div id="header">
            <div> HEADER </div>
          </div>
          <div id="title">
            <div> PROJECTS </div>
          </div>
          <div id="project-container">
            {projects}
          </div>
          <div id="new-project" className="link" onClick={this.newProject}>
            <div> NEW PROJECT </div>
          </div>
        </div>
      );
    }
  }
}
