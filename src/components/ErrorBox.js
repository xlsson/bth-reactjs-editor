import React from 'react';

class ErrorBox extends React.Component {
    render() {
        return (
            <div className="error-box">
                {this.props.message}
            </div>
        );
    }
}

export default ErrorBox;
