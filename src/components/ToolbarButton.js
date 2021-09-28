import React from 'react';

class ToolbarButton extends React.Component {
    render() {
        let classes = `toolbarButton ${this.props.classes}`;
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

export default ToolbarButton;
