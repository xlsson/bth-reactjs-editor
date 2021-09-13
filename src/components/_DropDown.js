import React from 'react';
import '../App.css';

class DropDown extends React.Component {
    render() {

        console.log(this);
        return (
            <select onChange={() => this.props.onChange()} value={this.props.dropdownSelected}>
                {this.props.documents.map(document => (
                    <option key={document._id} value={document._id}>
                        {document.filename}
                    </option>
                ))}
            </select>
        );
    }
}

export default DropDown;
