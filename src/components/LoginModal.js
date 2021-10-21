import React from 'react';
import TextInputField from './TextInputField.js';
import Button from './Button.js';

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
                    <div className="flex-row justify-content-center">
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
                            <p className="modal-textlink" onClick={this.registerInstead}>
                                Register instead
                            </p>
                            <div className="flex-row modal-buttons">
                                <>
                                <Button
                                    classes="lighter"
                                    elementId="buttonLoginCancel"
                                    label="CANCEL"
                                    onClick={this.cancel}/>
                                <Button
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
