import React from "react";

export default class App extends React.Component {

	constructor(props) {
    super(props);
    this.state = {};
  }

  signin() {
    console.log("Google sign in activated");
  }

  render () {
    return (
      <div id="login">
        <h1> SceneVR </h1>;
        <h3> Greeting or some other introductory copy? </h3>
        <div id="login-button" onClick={this.signin}> </div>

        <style jsx> {` 
          #login {
            height: 100vh;
            width: 100%;
            text-align: center;
            font-family: "Avenir Next";
          }

          #login h1 {
            font-weight: bold;
            color: #999;
          }

          #login h3 {
            font-style: italic;
            color: #999;
          }

          #login-button {
            width: 80%;
            height: 60px;
            margin: 0 auto;
            background-color: #ff675e;
          }
        `}</style>
      </div>
    ); 
  }
}
