import React from 'react';
import TextInputField from './TextInputField.js';
import ToolbarButton from './ToolbarButton.js';

class RegisterModal extends React.Component {
    constructor(props) {
        super(props);
        this.loginInstead = this.loginInstead.bind(this);
        this.cancel = this.cancel.bind(this);
        this.confirm = this.confirm.bind(this);
        this.handleTextInputChange = this.handleTextInputChange.bind(this);

        this.state = {
            email: "",
            name: "",
            password: ""
        };
    }

    loginInstead() {
        this.props.registerModal("close");
        this.props.loginModal("open");
    }

    cancel() {
        this.props.registerModal("close");
    }

    confirm() {
        this.props.registerModal("close");
        this.props.registerUser({
            email: this.state.email,
            name: this.state.name,
            password: this.state.password
        });
    }

    handleTextInputChange(ev, field) {
        if (field === "email") {
            this.setState({ email: ev });
            return;
        }
        if (field === "name") {
            this.setState({ name: ev });
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
                                elementId="nameInputField"
                                label="Name:"
                                name="name"
                                value={this.state.name}
                                onChange={(ev) => this.handleTextInputChange(ev, "name")}/>
                            <TextInputField
                                elementId="passwordInputField"
                                label="Password:"
                                name="password"
                                value={this.state.password}
                                onChange={(ev) => this.handleTextInputChange(ev, "password")}/>
                            <p className="login-register-link" onClick={this.loginInstead}>
                                Login instead
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
                                    elementId="buttonRegister"
                                    label="REGISTER"
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

export default RegisterModal;
