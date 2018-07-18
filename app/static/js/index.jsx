import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import CreateProject from "./CreateProject.jsx";
import Login from "./Login.jsx";
import Projects from "./projects.jsx"

require('./../stylesheets/login.css');
require('./../stylesheets/projects.css');
require('./../stylesheets/CreateProject.css');
require('./../stylesheets/ProjectListItem.css');
require('./../stylesheets/Project.css');
require('./../stylesheets/modal.css');

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
