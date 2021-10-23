import React from 'react';

class FilesDropDown extends React.Component {
    handleChange = (e) => {
        let i = e.target.value;
        let filename = this.props.availableFiles[i].filename;
        this.props.onChange(filename);
    }

    render() {
        let disabled = false;
        if (this.props.availableFiles.length === 0) {
            disabled = true;
        }

        let title = "Text documents";
        if (this.props.codeMode) {
            title = "Code documents";
        }

        return (
                <div className="flex-column">
                    <p className="field-title">{title}</p>
                    <select
                        className="select"
                        id={this.props.elementId}
                        onChange={this.handleChange}
                        disabled={disabled}>
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

export default FilesDropDown;
