import React from 'react';

class HeaderIcon extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange() {
        this.props.onClick();
    }

    render() {
        return (
                <div className="flex-column header-icon" onClick={this.props.onClick}>
                    <>
                    <li className="material-icons">{this.props.icon}</li>
                    <span className="header-icon-label">{this.props.label}</span>
                    </>
                </div>
        );
    }
}

export default HeaderIcon;
