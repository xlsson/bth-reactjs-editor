import React from 'react';
import '../App.css';

class RadioButton extends React.Component {
    render() {
        return (
            <div>
                <input type="radio" name="filename" id={this.props.id} onClick={() => this.props.onClick()}></input>
                <label htmlFor={this.props.id} onClick={() => this.props.onClick()}>{this.props.filename}</label>
            </div>
        );
    }
}

export default RadioButton;
