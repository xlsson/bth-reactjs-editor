import React from 'react';
import InviteFriend from './InviteFriend.js';
import ErrorBox from './ErrorBox.js';
import Button from './Button.js';

class ShareModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            users: [],
            inviteEmail: "",
            inviteFriend: false,
            error: false,
            messages: []
        };
    }

    handleCheckChange = (i) => {
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

    toggleInviteFriend = (action) => {
        if (action === "open") {
            this.setState({
                inviteFriend: true
            });
            return;
        }

        this.setState({
            inviteFriend: false,
            error: false,
            inviteEmail: ""
        });
        return;
    }

    handleInviteEmail = (e) => {
        this.setState({
            inviteEmail: e.target.value,
            error: false,
            messages: []
        });
    }

    cancel = () => {
        this.props.shareModal();
    }

    // Confirm selection: check that the new e-mail (if any) fulfills the
    // requirements, then update allowed users and send invite
    confirm = () => {
        const users = this.state.users;
        let updatedList = [];
        const inviteEmail = this.state.inviteEmail;

        if (inviteEmail.length > 0) {
            const emailIsValid = this.props.regexCheck("email", inviteEmail);

            if (!emailIsValid) {
                this.setState({
                    error: true,
                    messages: ["E-mail not formatted correctly"]
                });
                return;
            }

            const userExists = this.checkUserExists(inviteEmail);

            if (userExists) {
                this.setState({
                    error: true,
                    messages: ["This user is already registered"]
                });
                return;
            }

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

        // Close this modal
        this.props.shareModal();

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
        return userExists;
    }

    // Call function to send an e-mail invite
    sendInvite = (inviteEmail) => {
        this.props.sendInvite(inviteEmail);
    }

    renderInviteFriend = () => {
        return (
            <>
            <div id="invite-friend-wrapper">
                <InviteFriend
                    handleInviteEmail={this.handleInviteEmail}
                    toggleInviteFriend={() => this.toggleInviteFriend("close")}/>
            </div>
            <div id="invite-message-wrapper">
                {this.state.error && this.renderErrorMessage()}
            </div>
            </>
        );
    }

    renderInviteFriendLink = () => {
        return (
            <div id="invite-friend-wrapper">
                <p className="modal-textlink" onClick={() => this.toggleInviteFriend("open")}>
                    Click here to invite a new user
                </p>
            </div>
        );
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
                        <div className="modal-title">Manage editing rights</div>
                        <table className="share">
                            <>
                            <tbody>
                            {this.state.users.map((user, i) => (
                                <>
                                    <tr className="share">
                                        <td className="share">
                                            <input
                                                key={i}
                                                type="checkbox"
                                                value={user.checked}
                                                onChange={() => this.handleCheckChange(i)}
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
                        {!this.state.inviteFriend && this.renderInviteFriendLink()}
                        {this.state.inviteFriend && this.renderInviteFriend()}
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
