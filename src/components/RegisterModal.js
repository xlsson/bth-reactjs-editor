import React from 'react';
import ReactDOM from 'react-dom';
import ErrorBox from './ErrorBox.js';
import TextInputField from './TextInputField.js';
import Button from './Button.js';

class RegisterModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: "",
            name: "",
            password: ""
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
        let emailIsValid = this.props.checkEmailValid(email);
        let nameExists = (this.state.name.length > 0);
        let passwordExists = (this.state.name.length > 0);

        let errors = 0;
        let message = [];

        if (!emailIsValid) {
            message.push("E-mail is invalid");
            errors += 1;
        }
        if (!nameExists) {
            message.push("Name-field is empty");
            errors += 1;
        }
        if (!passwordExists) {
            message.push("Password-field is empty");
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

        this.errorMessage("show", message);
        return;
    }

    errorMessage = (action, message=[]) => {
        let div = document.getElementById("register-message-wrapper");
        if (action === "show") {
            let emailInput = document.getElementById('email-input-field');
            emailInput.classList.add("error-border");
            ReactDOM.render(
                <ErrorBox
                    message={message}/>
                    ,div
                );
            return;
        }

        let emailInput = document.getElementById('email-input-field');
        emailInput.classList.remove("error-border");
        ReactDOM.unmountComponentAtNode(div);
        return;
    }

    handleTextInputChange = (ev, field) => {
        if (field === "email") {
            this.errorMessage("hide");
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
                            <div id="register-message-wrapper"></div>
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
