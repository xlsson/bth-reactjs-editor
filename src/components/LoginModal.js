import React from 'react';
import TextInputField from './TextInputField.js';
import ErrorBox from './ErrorBox.js';
import Button from './Button.js';

/**
 * LoginModal component for displaying the login modal
 *
 * @component
 *
 * @member {object}  state -          State:
 * @member {string}  state.email -    E-mail for user wanting to log in
 * @member {string}  state.password - Password for user wanting to log in
 * @member {boolean} state.errors -   True = errors are present, false = no errors
 * @member {array}   state.messages - Array of error messages (strings)
 */
class LoginModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: "",
            password: "",
            errors: false,
            messages: []
        }
    }

    /**
     * Close this modal and open register modal, by calling props methods
     */
    registerInstead = () => {
        this.props.loginModal("close");
        this.props.registerModal("open");
    }

    /**
     * Close this modal
     */
    cancel = () => {
        this.props.loginModal("close");
    }

    /**
     * Handle click on confirm button. Check for errors and either close or
     * display an error message box.
     */
    confirm = () => {
        let email = this.state.email;
        let emailIsValid = this.props.regexCheck("email", email);
        let passwordExists = (this.state.password.length > 0);

        let errors = 0;
        let messages = [];

        if (!emailIsValid) {
            messages.push("E-mail is invalid");
            errors += 1;
        }
        if (!passwordExists) {
            messages.push("Password-field is empty");
            errors += 1;
        }

        if (errors === 0) {
            this.props.loginModal("close");
            this.props.loginAttempt(email, this.state.password);
            return;
        }

        this.setState({
            errors: true,
            messages: messages
        });
    }

    /**
     * Handle change in text input fields
     * @param  {object} ev      Event object
     * @param  {string} field   Field where a change was recorded
     */
    handleTextInputChange = (ev, field) => {
        if (field === "email") {
            this.setState({
                email: ev,
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
                <div className="flex-row justify-content-center">
                    <div className="modal-box flex-column">
                        <>
                        <div className="modal-title">Log in</div>
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
                        {this.state.errors && this.renderErrorMessage()}
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
