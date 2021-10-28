import React from 'react';

class StatusField extends React.Component {
    render() {
        return (
            <table className="status-field">
                <tbody>
                    <>
                        <tr className="status-field">
                            <td className="status-field textalignright">Logged in as:</td>
                            <td className="status-field textalignleft">{this.props.currentUserEmail}</td>
                        </tr>
                        <tr className="status-field">
                            <td className="status-field textalignright">Document owner:</td>
                            <td className="status-field textalignleft">{this.props.currentOwnerEmail}</td>
                        </tr>
                    </>
                </tbody>
            </table>
        );
    }
}

export default StatusField;
