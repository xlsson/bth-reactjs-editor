import React from 'react';

/**
 * TextInputField component to display a text input field with title
 *
 * @component
 */
class TextInputField extends React.Component {

    /**
     * Handle change in text input field
     * @param  {object} e      Event object
     */
    handleChange = (e) => {
        this.props.onChange(e.target.value, this.props.name);
    }

    render() {
        let disabled = false;
        if ((this.props.name === "docInfoFilename") && (this.props.saved)) {
            disabled = true;
        }
        return (
            <div className="flex-column">
                <label className="field-title" htmlFor={this.props.name}>{this.props.label}</label>
                <input
                    className="input"
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
