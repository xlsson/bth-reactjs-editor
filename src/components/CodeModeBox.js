import React from 'react';

class CodeModeBox extends React.Component {

    execute = () => {
        if (this.props.active) {
            this.props.execute();
        }
        return;
    }

    render() {
        let onoff = "OFF";
        let onoffColor = "gray";
        let mainColor = "gray";

        if (this.props.active) {
            onoff = "ON";
            onoffColor = "green";
            mainColor = "black";
        }
        return (
            <div className="flex-column">
                <p className="code-title">Code mode is <span className={onoffColor}>{onoff}</span></p>
                <div className="code-wrapper flex-row">
                    <div
                        className={`code-run-button-${onoff}`}
                        onClick={this.execute}>Execute</div>
                    <p
                        className={`material-icons code-icon ${mainColor}`}
                        onClick={this.props.toggle}>power_settings_new</p>
                </div>
            </div>
        );
    }
}

export default CodeModeBox;
