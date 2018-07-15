import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import SceneUpload from "./SceneUpload.jsx";
import CreateProject from "./CreateProject.jsx";
import Login from "./Login.jsx";
import Projects from "./Projects.jsx"

require('./../stylesheets/login.css');
require('./../stylesheets/upload.css');
require('./../stylesheets/projects.css');
require('./../stylesheets/create_projects.css');
require('./../stylesheets/listedProject.css');
require('./../stylesheets/projectPreview.css');
require('./../stylesheets/modal.css');

ReactDOM.render((
  <BrowserRouter>
    <Switch>
      <Route exact path='/' component={Projects} />
      <Route path='/create' component={CreateProject} />
      <Route path='/login' component={Login} />
      <Route path='/upload' component={SceneUpload} />
    </Switch>
  </BrowserRouter>
  ),
  document.querySelector('#app')
);
