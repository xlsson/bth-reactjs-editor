import React from 'react';

class Button extends React.Component {
    render() {
        let classes = `button ${this.props.classes}`;
        return (
            <button
                className={classes}
                id={this.props.elementId}
                onClick={() => this.props.onClick()}>
                    {this.props.label}
            </button>
        );
    }
}

export default Button;
