import React from "react";
import ReactDOM from "react-dom";

import { BrowserRouter, Route, Switch } from 'react-router-dom';

import SceneUpload from "./SceneUpload.jsx";
import CreateProject from "./CreateProject.jsx";
<<<<<<< HEAD
import Projects from "./projects.jsx";

ReactDOM.render(<CreateProject />, document.getElementById("content"));
=======
import Login from "./Login.jsx";
import Projects from "./Projects.jsx"

require('./../stylesheets/login.css');
require('./../stylesheets/upload.css');
require('./../stylesheets/projects.css');
require('./../stylesheets/create_projects.css');
require('./../stylesheets/individualProject.css');
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
>>>>>>> fedb8f06033b7844cf8de0937f3d9071d8bfe31b
