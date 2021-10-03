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
        console.log(selected);
        this.setState({
            allowedUsers: selected
        });
    }

    cancel() {
        this.props.shareModal("close");
    }

    confirm() {
        this.props.shareModal("close");
        this.props.changeAllowedUsers(
            this.state.allowedUsers
        );
    }

    render() {
        return (
            <div className="modal-background">
                <div className="modal-wrapper flex-row">
                    <div className="modal-box flex-column">
                        <>
                        <p className="field-title">Share this document with:</p>
                        <select
                            onChange={this.handleChange}
                            multiple="true">
                            {this.props.allowedUsers.map((user, i) => (
                                <option
                                    key={i}
                                    value={user}>
                                        {user}
                                    </option>
                            ))}
                        </select>
                        <div className="flex-row modal-buttons">
                            <>
                            <ToolbarButton
                                classes=""
                                elementId="buttonManageCancel"
                                label="CANCEL"
                                onClick={this.cancel}/>
                            <ToolbarButton
                                classes="purple"
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
