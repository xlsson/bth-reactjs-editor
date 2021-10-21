import React from 'react';

class ErrorBox extends React.Component {
    render() {
        return (
            <ul className="error-box">
                {this.props.message.map((msg, i) => (
                    <li key={i}>{msg}</li>
                ))}
            </ul>
        );
    }
}

export default ErrorBox;
