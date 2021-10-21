import React from 'react';
import ReactDOM from 'react-dom';
import InviteFriend from './InviteFriend.js';
import InviteFriendLink from './InviteFriendLink.js';
import ErrorBox from './ErrorBox.js';
import Button from './Button.js';

class ShareModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            users: [],
            inviteEmail: ""
        };
    }

    handleChange = (i) => {
        let oldValue = this.state.users[i].checked;
        let checked = !oldValue;

        let copiedList = this.state.users;
        let updatedListItem = {
            email: this.state.users[i].email,
            checked: checked
        };

        copiedList[i] = updatedListItem;

        this.setState({
            users: copiedList
        });
    }

    inviteFriend = (action) => {
        let inviteWrapper = document.getElementById("invite-friend-wrapper");
        if (action === "open") {
            ReactDOM.render(
                <InviteFriend
                    handleInviteEmail={this.handleInviteEmail}
                    close={this.inviteFriend}/>
                    ,inviteWrapper
                );
            return;
        }

        ReactDOM.unmountComponentAtNode(inviteWrapper);
        this.errorMessage("hide");
        ReactDOM.render(
            <InviteFriendLink
                inviteFriend={this.inviteFriend}/>
                ,inviteWrapper
            );
        return;
    }

    errorMessage = (action, message="") => {
        let div = document.getElementById("invite-message-wrapper");
        if (action === "show") {
            let inviteInput = document.getElementById('invite-input');
            inviteInput.classList.add("error-border");
            ReactDOM.render(
                <ErrorBox
                    message={message}/>
                    ,div
                );
            return;
        }

        let inviteInput = document.getElementById('invite-input');
        if (inviteInput) {
            inviteInput.classList.remove("error-border");
        }
        ReactDOM.unmountComponentAtNode(div);
        return;
    }

    handleInviteEmail = (e) => {
        this.errorMessage("hide");
        this.setState({
            inviteEmail: e.target.value
        });
    }

    cancel = () => {
        this.props.shareModal("close");
    }

    // Confirm selection: check that the new e-mail (if any) fulfills the
    // requirements, then update allowed users and send invite
    confirm = () => {
        const users = this.state.users;
        let updatedList = [];
        const inviteEmail = this.state.inviteEmail;

        if (inviteEmail.length > 0) {
            const emailIsValid = this.checkEmailValid(inviteEmail);

            if (!emailIsValid) { return; }

            const userExists = this.checkUserExists(inviteEmail);

            if (userExists) { return; }

            this.sendInvite(inviteEmail);
            updatedList.push(inviteEmail);
        }

        // Create the updated list of allowed users
        users.forEach((user) => {
            // If user already invited, don't add them to allowed users again
            if (user.email !== inviteEmail) {
                if (user.checked) { updatedList.push(user.email); }
            };
        });
        updatedList.push(this.props.currentUserEmail);

        this.props.shareModal("close");

        this.props.updateUsers(updatedList);
    }

    // Check that email isn't already among registered users
    checkUserExists = (inviteEmail) => {
        let userExists = false;
        this.props.allUsers.forEach((user) => {
            if (user.email === inviteEmail) {
                userExists = true;
            }
        });

        if (userExists) {
            this.errorMessage("show", "This user is already registered");
            return true;
        }

        return false;
    }

    // Check that email is a valid e-mail address
    checkEmailValid = (inviteEmail) => {
        const regex = new RegExp(/^[a-zA-Z0-9]+@(?:[a-zA-Z0-9]+\.)+[A-Za-z]+$/);
        const emailIsValid = regex.test(inviteEmail);

        if (!emailIsValid) {
            this.errorMessage("show", "E-mail not formatted correctly");
        }

        return emailIsValid;
    }

    // Call function to send an e-mail invite
    sendInvite = (inviteEmail) => {
        this.props.sendInvite(inviteEmail);
    }

    render() {
        return (
            <div className="modal-background">
                <div className="modal-wrapper flex-row">
                    <div className="modal-box flex-column">
                        <>
                        <table className="share">
                            <>
                            <thead>
                                <tr className="share">
                                    <>
                                        <th className="share textalignleft" colSpan="2">
                                            Manage editing rights
                                        </th>
                                    </>
                                </tr>
                            </thead>
                            <tbody>
                            {this.state.users.map((user, i) => (
                                <>
                                    <tr key={i} className="share">
                                        <td className="share">
                                            <input
                                                type="checkbox"
                                                value={user.checked}
                                                onChange={() => this.handleChange(i)}
                                                checked={this.state.users[i].checked}>
                                            </input>
                                        </td>
                                        <td className="share textalignleft">{user.email}</td>
                                    </tr>
                                </>
                            ))}
                            </tbody>
                            </>
                        </table>
                        <div id="invite-friend-wrapper">
                            <InviteFriendLink
                                inviteFriend={this.inviteFriend}/>
                        </div>
                        <div id="invite-message-wrapper">
                        </div>
                        <div className="flex-row modal-buttons">
                            <>
                            <Button
                                classes="lighter"
                                elementId="buttonShareCancel"
                                label="CANCEL"
                                onClick={this.cancel}/>
                            <Button
                                classes="red"
                                elementId="buttonShareSave"
                                label="SAVE"
                                onClick={this.confirm} />
                            </>
                        </div>
                        </>
                    </div>
                </div>
            </div>
        );
    }

    componentDidMount = () => {
        // Create a list of all users in the db, and if they are allowed to
        // edit or not. Exclude the currently logged in user.
        let allUsers = this.props.allUsers;
        let allowedUsers = this.props.allowedUsers;
        let currentUserEmail = this.props.currentUserEmail;
        let users = [];

        // Add all allowed users, and set their checked property to true
        allowedUsers.forEach((user) => {
            if (user !== currentUserEmail) {
                users.push({ email: user, checked: true });
            }
        });

        // Add all other users, and set their checked property to false
        allUsers.forEach((user) => {
            if ((!allowedUsers.includes(user.email)) && (user.email !== currentUserEmail)) {
                users.push({ email: user.email, checked: false });
            }
        });

        this.setState({
            users: users
        });
    }

}

export default ShareModal;
