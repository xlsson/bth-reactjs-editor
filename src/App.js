import React from 'react';
import ReactQuill from 'react-quill';
import ToolbarButton from './components/ToolbarButton.js';
import RadioButton from './components/RadioButton.js';
import backend from './functions/Backend.js';

import './App.css';
import 'react-quill/dist/quill.bubble.css';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentId: '',
            currentFilename: 'placeholderFilename',
            currentTitle: 'placeholderTitle',
            currentContent: 'placeholderText',
            selectedDocId: '',
            allDocuments: []
        };

        this.contentChange = this.contentChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    saveInStateAll = (data) => {
        this.setState({
            allDocuments: data
        });
    }

    saveInStateOne = (data) => {
        let doc = data[0];
        this.setState({
            currentId: doc._id,
            currentFilename: doc.filename,
            currentTitle: doc.title,
            currentContent: doc.content
        });
    }

    contentChange = (ev) => {
        this.setState({
            currentContent: ev
        });
        console.log(this.state.currentContent);
    }

    handleSelectRadio = (documentid) => {
        this.setState({
            selectedDocId: documentid
        });
        console.log(this.state.selectedDocId);
    }

    handleClick = (action) => {
        if (action === "save") {
            console.log(action);
        }
        if (action === "clear") {
        this.setState({
            currentId: '',
            currentFilename: '',
            currentTitle: '',
            currentContent: ''
        });
        }
        if (action === "open") {
            backend("open", this.saveInStateOne, this.state.selectedDocId);
        }
    }

    render() {
        console.log("rendered");
        return (
            <div className="App">
                <div className="toolbar">
                    <ToolbarButton label="Save" onClick={() => this.handleClick("save")} />
                    <ToolbarButton label="Clear" onClick={() => this.handleClick("clear")} />
                </div>
                <div className="editorContainer">
                    <ReactQuill theme="bubble" value={this.state.currentContent} onChange={(ev) => this.contentChange(ev)}/>
                </div>
                <div className="toolbar">
                    <div className="radioWrapper">
                        {this.state.allDocuments.map((document, i) => (
                            <RadioButton key={i} id={document._id} filename={document.filename} onClick={() => this.handleSelectRadio(document._id)} />
                        ))}
                    </div>
                    <ToolbarButton label="Load document" onClick={() => this.handleClick("open")} />
                </div>
            </div>
        );
    }

    componentDidMount = () => {
        backend("readall", this.saveInStateAll);
    }
}

export default App;
