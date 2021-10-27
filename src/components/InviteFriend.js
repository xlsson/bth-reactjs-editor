import React from 'react';

class InviteFriend extends React.Component {
    render() {
        return (
            <div className="flex-column invite-wrapper">
                <>
                <div className="flex-row invite-title-wrapper">
                    <>
                    <label className="field-title" htmlFor="">Invite to edit (e-mail)</label>
                    <p
                        className="material-icons cancel-icon"
                        onClick={this.props.toggleInviteFriend}>
                        cancel
                    </p>
                    </>
                </div>
                <div className="flex-row invite-input-wrapper">
                    <>
                        <input
                            id="invite-input"
                            className="input "
                            type="text"
                            name="inviteEmail"
                            onChange={this.props.handleInviteEmail}>
                        </input>
                    </>
                </div>
                </>
            </div>
        );
    }
}

export default InviteFriend;
