import React from 'react';
import TextInputField from './TextInputField.js';
import ToolbarButton from './ToolbarButton.js';

class LoginModal extends React.Component {
    constructor(props) {
        super(props);
        this.registerInstead = this.registerInstead.bind(this);
        this.cancel = this.cancel.bind(this);
        this.confirm = this.confirm.bind(this);
        this.handleTextInputChange = this.handleTextInputChange.bind(this);

        this.state = {
            email: "",
            password: ""
        }
    }

    registerInstead() {
        this.props.loginModal("close");
        this.props.registerModal("open");
    }

    cancel() {
        this.props.loginModal("close");
    }

    confirm() {
        this.props.loginModal("close");
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
                <div className="modal-background">
                    <div className="modal-wrapper flex-row">
                        <div className="modal-box flex-column">
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
                            <p className="login-register-link" onClick={this.registerInstead}>
                                Register instead
                            </p>
                            <div className="flex-row modal-buttons">
                                <>
                                <ToolbarButton
                                    classes="lighter"
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
