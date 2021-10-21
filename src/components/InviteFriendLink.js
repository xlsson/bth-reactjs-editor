import React from 'react';

class InviteFriendLink extends React.Component {
    render() {
        return (
            <p className="modal-textlink" onClick={() => this.props.inviteFriend("open")}>
                Click here to invite a new user
            </p>
        );
    }
}

export default InviteFriendLink;
