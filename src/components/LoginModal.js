import React from 'react';
import TextInputField from './TextInputField.js';
import ToolbarButton from './ToolbarButton.js';

class LoginModal extends React.Component {
    constructor(props) {
        super(props);
        this.cancel = this.cancel.bind(this);
        this.confirm = this.confirm.bind(this);
        this.handleTextInputChange = this.handleTextInputChange.bind(this);

        this.state = {
            email: "",
            password: ""
        }
    }

    cancel() {
        this.props.onClick("close");
    }

    confirm() {
        this.props.onClick("close");
        this.props.loginAttempt(
            this.state.email,
            this.state.password
        );
    }

    handleTextInputChange(ev, field) {
        if (field === "email") {
            this.setState({ email: ev });
            return;
        }
        if (field === "password") {
            this.setState({ password: ev });
            return;
        }
    }

    render() {
        return (
                <div id="login-modal-background">
                    <div className="login-wrapper flex-row">
                        <div className="login-box flex-column">
                            <>
                            <TextInputField
                                elementId="emailInputField"
                                label="Username (e-mail):"
                                name="email"
                                value={this.state.email}
                                onChange={(ev) => this.handleTextInputChange(ev, "email")}/>
                            <TextInputField
                                elementId="passwordInputField"
                                label="Password:"
                                name="password"
                                value={this.state.password}
                                onChange={(ev) => this.handleTextInputChange(ev, "password")}/>
                            <a className="login-register-link" href="">
                                Register
                            </a>
                            <div className="flex-row login-modal-buttons">
                                <>
                                <ToolbarButton
                                    classes=""
                                    elementId="buttonLoginCancel"
                                    label="CANCEL"
                                    onClick={this.cancel}/>
                                <ToolbarButton
                                    classes="red"
                                    elementId="buttonLogin"
                                    label="LOG IN"
                                    onClick={this.confirm}/>
                                </>
                            </div>
                            </>
                        </div>
                    </div>
                </div>
        );
    }
}

export default LoginModal;
