import React from 'react';

class TextInputField extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        this.props.onChange(e.target.value, this.props.name);
    }

    render() {
        let disabled = false;
        if ((this.props.name === "docInfoFilename") && (this.props.id.length > 0)) {
            disabled = true;
        }
        return (
            <div className="flex-column">
                <label className="field-title" htmlFor={this.props.name}>{this.props.label}</label>
                <input
                    id={this.props.elementId}
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
