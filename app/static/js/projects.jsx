import React from "react";
import IndividualProject from './components/IndividualProject.jsx';

export default class Projects extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      projectData: [
        {
          "title": "Test",
          "desc": "Shortened description and such will fo here, but will also get cut if there's too much text",
          "date": "March 14th",
        },

        {
          "title": "Test",
          "desc": "Shortened description and such will fo here, but will also get cut if there's too much text",
          "date": "March 14th",
        },

        {
          "title": "Test",
          "desc": "Shortened description and such will fo here, but will also get cut if there's too much text",
          "date": "March 14th",
        }
      ],
      error: null,
    };

    this.newProject = this.newProject.bind(this);
  }

  componentDidMount() {
    fetch("/projects", {'credentials': 'include'})
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result);
          this.setState({
            items: result.items
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            error
          });
        }
      )
  }

  newProject(){
    console.log("new project!");
  }

  render() {
    const { error, items } = this.state;
    return (
      <div id="projects">
        <div id="header">
          <div> HEADER </div>
        </div>
        <div id="title">
          <div> PROJECTS </div>
        </div>
        <div id="project-container">
          {this.state.projectData.map(proj => (
            <IndividualProject title={proj.title} desc={proj.desc} date={proj.date} />
          ))}
        </div>
        <div id="new-project" onClick={this.newProject}>
          <div> NEW PROJECT </div>
        </div>
      </div>
    );
  }
}
