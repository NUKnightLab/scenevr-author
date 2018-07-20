import React from "react";
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Redirect } from 'react-router';

import ProjectListItem from './components/ProjectListItem.jsx';

export default class Projects extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            projectData: null,
            error: null,
            redirectCreate: false,
            redirectLogout: false,
            newProjectId: null,
            userName: null,
            userPicture: null
        };

        this.newProject = this.newProject.bind(this);
    }

    componentDidMount() {
        fetch("/projects", {'credentials': 'include'})
        .then(res => res.json())
        .then(
            (result) => {
                this.setState({
                    projectData: result['projectArray'],
                    userName: result['userName'],
                    userPicture: result['userPicture']
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
                    redirectCreate: true,
                    newProjectId: result.project_id
                });
            },
            (error) => {
                this.setState({error});
            }
        )
    }

    render() {
        const { error, projectData, redirectCreate} = this.state;
        if (redirectCreate){
            return (
                <Redirect to={{
                    pathname: '/create',
                    state: {
                        projectId: this.state.newProjectId
                    }
                }}/>
            );
        }

        let projects = null;
        console.log(projectData)
        if (projectData) {
            if (projectData.length == 0) {
                console.log("NOPE")
                projects = <div id="welcome"> <span>👇 🏞 😆</span> Create a new project to get started!</div>
            } else {
                projects = projectData ? (
                    projectData.map(proj => (
                        <ProjectListItem key={proj.id} id={proj.id} title={proj.title} desc={proj.desc} date={proj.date} thumbnail={proj.thumbnail} />
                    ))
                ) : (null);
            }
        }

        if (error){
            return <div>Error: {error.message}</div>;
        } else {
            return (
                <div id="projects">

                    <div id="header">
                        <div id="logout">
                            <a href="/logout">Sign out</a>
                        </div>
                        <div id="logo">Scene <span>VR</span></div>
                        <div id="user">
                            <img id="user-picture" alt={this.state.userName} src={this.state.userPicture}/>
                        </div>
                    </div>

                    <div id="title">
                        <div> Your Projects </div>
                    </div>

                    <div id="project-container">
                        {projects}
                    </div>

                    <div id="new-project" className="button-bottom-container" onClick={this.newProject}>
                        <div className="button-bottom"> <span className="icon-folder"></span> New Project </div>
                    </div>

                </div>
            );
        }

    }
}
