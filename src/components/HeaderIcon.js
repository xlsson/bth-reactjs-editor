import React from 'react';

class HeaderIcon extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        if (this.props.active) {
            this.props.onClick("open");
        }
    }

    render() {
        let classes = "flex-column header-icon";
        if (!this.props.active) {
            classes += " inactive-icon";
        }
        return (
                <div className={classes} onClick={this.handleClick}>
                    <>
                    <li className="material-icons">{this.props.icon}</li>
                    <span className="header-icon-label">{this.props.label}</span>
                    </>
                </div>
        );
    }
}

export default HeaderIcon;
