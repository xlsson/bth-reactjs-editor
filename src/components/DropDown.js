import React from 'react';
import '../App.css';

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
                <select name="selectedDocId" onChange={this.handleChange}>
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
