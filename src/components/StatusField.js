import React from 'react';

class StatusField extends React.Component {
    render() {
        return (
            <div className="flex-column">
                <>
                <div className="field-title">Logged in as: {this.props.currentUserEmail}</div>
                <div className="field-title">Document owner: {this.props.currentOwnerEmail}</div>
                </>
            </div>
        );
    }
}

export default StatusField;
