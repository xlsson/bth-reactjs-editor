import React from 'react';

/**
 * CodeModeBox component for toggling code mode
 *
 * @component
 */
class CodeModeBox extends React.Component {

    /**
     * Call props.execute() function to execute the code
     */
    execute = () => {
        if (this.props.active) {
            this.props.execute();
        }
        return;
    }

    render() {
        let onoff = "OFF";
        let onoffColor = "gray";

        if (this.props.active) {
            onoff = "ON";
            onoffColor = "black onoff-text-shadow";
        }
        return (
            <div className="flex-column">
                <p className="code-title">Code mode is <span className={onoffColor}>{onoff}</span></p>
                <div className="code-wrapper flex-row">
                    <div
                        className={`code-run-button-${onoff}`}
                        onClick={this.execute}>Execute</div>
                    <p
                        className={`material-icons code-icon ${onoffColor}`}
                        onClick={this.props.toggle}>power_settings_new</p>
                </div>
            </div>
        );
    }
}

export default CodeModeBox;
