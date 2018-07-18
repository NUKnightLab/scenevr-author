import React from "react";

export default class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    signin() {
        window.location.href = '/google/authorize'
    }

    render() {
        return (
            <div id="login">
            <h1> SceneVR </h1>
            <h3> Greeting or some <br /> other introductory copy? </h3>
            <div id="login-button" onClick={this.signin}> <p> Sign in with Google </p> </div>
            </div>
        );
    }
}
