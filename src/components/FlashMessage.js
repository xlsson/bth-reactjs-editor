import React from 'react';

/**
 * FlashMessage component for showing flash messages
 *
 * @component
 */
class FlashMessage extends React.Component {

    render() {
        return (
            <div className={`flash-message-${this.props.message.type}`}>
                {this.props.message.text}
            </div>
        );
    }
}

export default FlashMessage;
