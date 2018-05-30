import React from "react";

export default class App extends React.Component {

	constructor(props) {
    super(props);
    this.state = {};
  }

  signin() {
    console.log("Google sign in activated");
  }

  render() {
    return (
      <div id="login">
        <h1> SceneVR </h1>
        <h3> Greeting or some <br /> other introductory copy? </h3>
        <div id="login-button" onClick={this.signin}> <p> Sign in with Google </p> </div>

        <style jsx> {` 
          #login {
            height: 100vh;
            width: 100%;
            text-align: center;
            font-family: "Avenir Next";
            overflow-y: hidden;
          }

          #login * {
            position: relative;
          }

          #login h1 {
            font-weight: bold;
            color: #999;
            margin-top: 100px;
            margin-bottom: 80px;
          }


          #login h3 {
            font-style: italic;
            color: #999;
            font-size: 1.3rem;
            margin-bottom: 50px;
          }

          #login-button {
            position: absolute;
            border-radius: 5px;
            width: 80%;
            height: 60px;
            margin: 90px auto;
            background-color: #ff675e;
          }

          #login-button p {
            color: white;
            position: relative;
            top: 30%;
          }
        `}</style>
      </div>
    ); 
  }
}
