import React from 'react';
import '../App.css';

class SelectOption extends React.Component {
    render() {
        return (
            <option id={this.props.id} onClick={() => this.props.onClick()} value={this.props.id}>
                {this.props.filename}
            </option>
        );
    }
}

export default SelectOption;
