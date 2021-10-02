import React from 'react';

class DropDown extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        this.props.onChange(e.target.value);
    }

    render() {
        let disabled = false;
        if (this.props.availableFiles.length === 0) {
            disabled = true;
        }
        return (
                <div className="flex-column">
                    <p className="field-title">{this.props.title}</p>
                    <select id={this.props.elementId} onChange={this.handleChange} disabled={disabled}>
                        {this.props.availableFiles.map((filename, i) => (
                            <option
                                key={i}
                                value={filename}>
                                    {filename}
                                </option>
                        ))}
                    </select>
                </div>
        );
    }
}

export default DropDown;
