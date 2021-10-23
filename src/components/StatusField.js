import React from 'react';

class StatusField extends React.Component {
    render() {
        return (
            <div className="flex-row">
                <>
                    <div className="flex-column justify-flex-end">
                        <>
                        <div className="status-label">Logged in as:</div>
                        <div className="status-label">Document owner:</div>
                        </>
                    </div>
                    <div className="flex-column">
                        <>
                        <div className="status-info">{this.props.currentUserEmail}</div>
                        <div className="status-info">{this.props.currentOwnerEmail}</div>
                        </>
                    </div>
                </>
            </div>
        );
    }
}

export default StatusField;
