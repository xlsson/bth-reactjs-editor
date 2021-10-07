import React from 'react';

class DropDown extends React.Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        let i = e.target.value;
        let filename = this.props.availableFiles[i].filename;
        this.props.onChange(filename);
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
                        {this.props.availableFiles.map((doc, i) => (
                            <option
                                key={i}
                                value={i}>
                                    {doc.filename}
                                </option>
                        ))}
                    </select>
                </div>
        );
    }
}

export default DropDown;
