import React from 'react';

/**
 * HeaderIcon component for displaying a header icon
 *
 * @component
 */
class HeaderIcon extends React.Component {

    /**
     * Handle click on icon, call props.onClick() if props.active is true
     */
    handleClick = () => {
        if (this.props.active) {
            this.props.onClick();
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
