import React, { Component } from 'react';

export default class LoginDialog extends Component {
    constructor(props) {
        super(props)
        this.state = {
            password:''
        }
    }
    edit = (e) => this.setState({password:e.target.value})
    keyDown = (e) => {
        if(e.keyCode === 13) {
            console.log("pressed enter")
            this.props.store.login(this.state.password)
        }
    }

    render() {
        return <div>
            <input type="text" value={this.state.password} onChange={this.edit} onKeyDown={this.keyDown}/>
        </div>
    }
}