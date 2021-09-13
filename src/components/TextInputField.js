import React from 'react';
import '../App.css';

class TextInputField extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        this.props.onChange(e.target.value);
    }

    render() {
        let disabled = false;
        if ((this.props.name === "titleFilename") && (this.props.id.length > 0)) {
            disabled = true;
        }
        return (
            <div>
                <label htmlFor={this.props.name}>{this.props.label}</label>
                <input
                    type="text"
                    name={this.props.name}
                    value={this.props.value}
                    onChange={this.handleChange}
                    disabled={disabled}>
                </input>
            </div>

        );
    }
}

export default TextInputField;
