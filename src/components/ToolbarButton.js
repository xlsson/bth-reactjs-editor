import React from 'react';
import '../App.css';

class ToolbarButton extends React.Component {
    render() {
        return (
            <button className="toolbarButton" onClick={() => this.props.onClick()}>{this.props.label}</button>
        );
    }
}

export default ToolbarButton;