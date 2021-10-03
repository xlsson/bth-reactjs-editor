import React from 'react';
import ToolbarButton from './ToolbarButton.js';

class ManageAllowedUsers extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.cancel = this.cancel.bind(this);
        this.confirm = this.confirm.bind(this);

        this.state = {
            allowedUsers: []
        };
    }

    handleChange(e) {
        let selected = Array.from(
            e.target.selectedOptions,
            function(option) {
                return option.value;
            }
        );
        this.setState({
            allowedUsers: selected
        });
    }

    cancel() {
        this.props.shareModal("close");
    }

    confirm() {
        let allowedUsers = this.state.allowedUsers;
        allowedUsers.push(this.props.currentUserEmail);
        this.props.shareModal("close");
        this.props.updateUsers(allowedUsers);
    }

    render() {
        let allUsers = this.props.allUsers;
        let allowedUsers = this.props.allowedUsers;
        let currentUserEmail = this.props.currentUserEmail;
        let allowedList = [];

        allUsers.forEach((user) => {
            if (user !== currentUserEmail) {
                let selected = "";
                if (allowedUsers.includes(user)) { selected = "selected"; }
                allowedList.push({ email: user, selected: selected });
            }
        });
        return (
            <div className="modal-background">
                <div className="modal-wrapper flex-row">
                    <div className="modal-box flex-column">
                        <>
                        <p className="field-title">Share this document with:</p>
                        <select
                            className="multiple"
                            onChange={this.handleChange}
                            multiple="true">
                            {allowedList.map((user, i) => (
                                <option
                                    key={i}
                                    value={user.email}
                                    selected={user.selected}>
                                        {user.email}
                                    </option>
                            ))}
                        </select>
                        <div className="flex-row modal-buttons">
                            <>
                            <ToolbarButton
                                classes="lighter"
                                elementId="buttonManageCancel"
                                label="CANCEL"
                                onClick={this.cancel}/>
                            <ToolbarButton
                                classes="red"
                                elementId="buttonManageAllowedUsers"
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
}

export default ManageAllowedUsers;
