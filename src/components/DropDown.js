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
        return (
                <select id={this.props.elementId} onChange={this.handleChange}>
                    {this.props.docList.map((document, i) => (
                        <option
                            key={i}
                            value={document._id}>
                                {document.filename}
                            </option>
                    ))}
                </select>

        );
    }
}

export default DropDown;
