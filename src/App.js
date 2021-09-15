import React from 'react';
import ReactQuill from 'react-quill';
import ToolbarButton from './components/ToolbarButton.js';
import TextInputField from './components/TextInputField.js';
import DropDown from './components/DropDown.js';
import backend from './functions/Backend.js';

import './App.css';
import 'react-quill/dist/quill.bubble.css';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentId: '',
            currentFilename: '',
            currentTitle: '',
            currentContent: '',
            selectedDocId: '',
            allDocuments: [],
            latestMessage: 'Ready to create a new document.'
        };

        this.contentChange = this.contentChange.bind(this);
        this.handleTitleChange = this.handleTitleChange.bind(this);
        this.handleFilenameChange = this.handleFilenameChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    afterReadAll = (data) => {
        this.setState({
            allDocuments: data
        });
    }

    afterReadOne = (data) => {
        let doc = data[0];
        this.setState({
            currentId: doc._id,
            currentFilename: doc.filename,
            currentTitle: doc.title,
            currentContent: doc.content,
            latestMessage: `Loaded document "${doc.filename}"`
        });
    }

    afterCreateDoc = (data) => {
        if (data[0].exists === "false") {
            this.setState({
                currentId: data[0].insertedId,
                latestMessage: "Saved new document in database."
            });
            backend("readall", this.afterReadAll);
            return;
        }

        this.setState({
            latestMessage: "Filename already exists. Choose another name."
        });

        return;
    }

    afterUpdate = (data) => {
        this.setState({
            latestMessage: "Saved document changes in database."
        });
        return;
    }

    handleTitleChange = (ev) => {
        this.setState({
            currentTitle: ev
        });
    }

    handleFilenameChange = (ev) => {
        this.setState({
            currentFilename: ev
        });
    }

    contentChange = (ev) => {
        this.setState({
            currentContent: ev
        });
    }

    handleDropDownChange = (documentid) => {
        this.setState({
            selectedDocId: documentid
        });
    }

    handleClick = (action) => {
        if ((action === "save") && (this.state.currentId.length === 0)) {
            backend("create",
                this.afterCreateDoc, {
                    filename: this.state.currentFilename,
                    title: this.state.currentTitle,
                    content: this.state.currentContent,
                 }
            );
            return;
        }

        if ((action === "save") && (this.state.currentId.length > 0)) {
            backend("update",
                this.afterUpdate, {
                    docid: this.state.currentId,
                    title: this.state.currentTitle,
                    content: this.state.currentContent,
                 }
            );
            return;
        }

        if (action === "clear") {
            this.setState({
                currentId: '',
                currentFilename: '',
                currentTitle: '',
                currentContent: '',
                latestMessage: `Cleared. Ready to create a new document.`
            });
            return;
        }

        if (action === "open") {
            backend("open",
                this.afterReadOne,
                { id: this.state.selectedDocId }
            );
            return;
        }
    }

    render() {
        return (
            <div className="App">
                <div className="toolbar">
                    <TextInputField
                        label="Document title: "
                        name="titleTitle"
                        value={this.state.currentTitle}
                        id={this.state.currentId}
                        onChange={this.handleTitleChange}/>
                    <TextInputField
                        label="Filename (must be unique): "
                        name="titleFilename"
                        value={this.state.currentFilename}
                        id={this.state.currentId}
                        onChange={this.handleFilenameChange}/>
                    <ToolbarButton
                        label="Save"
                        onClick={() => this.handleClick("save")} />
                    <ToolbarButton
                        label="Clear (new document)"
                        onClick={() => this.handleClick("clear")} />
                    <p>Load document:</p>
                    <DropDown
                        docList={this.state.allDocuments}
                        onChange={this.handleDropDownChange}/>
                    <ToolbarButton
                        label="Load"
                        onClick={() => this.handleClick("open")} />
                </div>
                <div className="messageBox">
                    <strong>{this.state.latestMessage}</strong>
                </div>
                <div className="editorContainer">
                    <ReactQuill
                    theme="bubble"
                    value={this.state.currentContent}
                    onChange={(ev) => this.contentChange(ev)}/>
                </div>
            </div>
        );
    }

    componentDidMount = () => {
        backend("readall", this.afterReadAll);
    }
}

export default App;
