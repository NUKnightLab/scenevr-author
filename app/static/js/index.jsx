import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import CreateProject from "./CreateProject.jsx";
import Login from "./Login.jsx";
import Projects from "./Projects.jsx"

require('./../stylesheets/Login.css');
require('./../stylesheets/Projects.css');
require('./../stylesheets/CreateProject.css');
require('./../stylesheets/ProjectListItem.css');
require('./../stylesheets/Project.css');
require('./../stylesheets/Modal.css');

ReactDOM.render(
    (
        <BrowserRouter>
            <Switch>
                <Route exact path='/list-projects' component={Projects} />
                <Route path='/create' component={CreateProject} />
                <Route path='/login' component={Login} />
            </Switch>
        </BrowserRouter>
    ),
    document.querySelector('#app')
);
