import React from 'react';
import ErrorBox from './ErrorBox.js';
import TextInputField from './TextInputField.js';
import Button from './Button.js';

class RegisterModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: "",
            name: "",
            password: "",
            errors: false,
            messages: []
        };
    }

    loginInstead = () => {
        this.props.registerModal("close");
        this.props.loginModal("open");
    }

    cancel = () => {
        this.props.registerModal("close");
    }

    confirm = () => {
        let email = this.state.email;
        let emailIsValid = this.props.regexCheck(email);
        console.log("emailIsValid :", emailIsValid);
        let nameExists = (this.state.name.length > 0);
        let passwordExists = (this.state.password.length > 0);

        let errors = 0;
        let messages = [];

        if (!emailIsValid) {
            messages.push("E-mail is invalid");
            errors += 1;
        }
        if (!nameExists) {
            messages.push("Name-field is empty");
            errors += 1;
        }
        if (!passwordExists) {
            messages.push("Password-field is empty");
            errors += 1;
        }

        if (errors === 0) {
            this.props.registerModal("close");
            this.props.registerUser({
                email: email,
                name: this.state.name,
                password: this.state.password
            });
            return;
        }

        this.setState({
            errors: true,
            messages: messages
        });
    }

    handleTextInputChange = (ev, field) => {
        if (field === "email") {
            this.setState({
                email: ev,
                errors: false
             });
            return;
        }
        if (field === "name") {
            this.setState({
                name: ev,
                errors: false
             });
            return;
        }
        if (field === "password") {
            this.setState({
                password: ev,
                errors: false
             });
            return;
        }
    }

    renderErrorMessage = () => {
        return (
            <div id="register-message-wrapper">
                <ErrorBox message={this.state.messages}/>
            </div>
        );
    }

    render() {
        return (
                <div className="modal-background">
                    <div className="modal-wrapper flex-row">
                        <div className="modal-box flex-column">
                            <>
                            <TextInputField
                                elementId="email-input-field"
                                label="Username (e-mail):"
                                name="email"
                                value={this.state.email}
                                onChange={(ev) => this.handleTextInputChange(ev, "email")}/>
                            <TextInputField
                                elementId="name-input-field"
                                label="Name:"
                                name="name"
                                value={this.state.name}
                                onChange={(ev) => this.handleTextInputChange(ev, "name")}/>
                            <TextInputField
                                elementId="password-input-field"
                                label="Password:"
                                name="password"
                                value={this.state.password}
                                onChange={(ev) => this.handleTextInputChange(ev, "password")}/>
                            {this.state.errors && this.renderErrorMessage()}
                            <p className="modal-textlink" onClick={this.loginInstead}>
                                Login instead
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
