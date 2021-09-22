import React from 'react';
import ReactQuill from 'react-quill';
import ToolbarButton from './components/ToolbarButton.js';
import TextInputField from './components/TextInputField.js';
import DropDown from './components/DropDown.js';
import backend from './functions/Backend.js';
import socketIOClient from "socket.io-client";

import './App.css';
import 'react-quill/dist/quill.bubble.css';

const ENDPOINT = "https://jsramverk-editor-riax20.azurewebsites.net";
const socket = socketIOClient(ENDPOINT);

class App extends React.Component {
    constructor(props) {
        super(props);

        this._isMounted = false;

        this._wasWrittenLocally = true;

        this.state = {
            currentId: '',
            currentFilename: '',
            currentTitle: '',
            currentContent: '',
            selectedDocId: '',
            allDocuments: [],
            latestMessage: 'Ready to create a new document.'
        };

        this.handleContentChange = this.handleContentChange.bind(this);
        this.handleTitleChange = this.handleTitleChange.bind(this);
        this.handleFilenameChange = this.handleFilenameChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    afterReadAll = (data) => {
        if (this._isMounted) {
            this.setState({
                allDocuments: data
            });
        }
    }

    afterReadOne = (data) => {
        let doc = data[0];

        this.switchRoom(doc._id);
        this.setState({
            currentId: doc._id,
            currentFilename: doc.filename,
            currentTitle: doc.title,
            currentContent: doc.content,
            latestMessage: `Loaded document "${doc.filename}"`
        });
    }

    afterCreateDoc = (data) => {
        let doc = data[0];

        if (doc.exists === "false") {
            this.switchRoom(doc.insertedId);
            this.setState({
                currentId: doc.insertedId,
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

    handleContentChange = (ev) => {
        if (this._wasWrittenLocally) {
            this.setState({
                currentContent: ev
            });
            if (this.state.currentId.length > 0) {
                let data = {
                    room: this.state.currentId,
                    content: ev
                };
                socket.emit("sendContent", data);
            }
        }
        this._wasWrittenLocally = true;
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

    switchRoom = (newRoom) => {
        socket.emit("leave", this.state.currentId);
        socket.emit("join", newRoom);
    }

    render() {
        return (
            <div className="App">
                <div className="toolbar">
                    <TextInputField
                        elementId="titleInputField"
                        label="Document title: "
                        name="titleTitle"
                        value={this.state.currentTitle}
                        id={this.state.currentId}
                        onChange={this.handleTitleChange}/>
                    <TextInputField
                        elementId="filenameInputField"
                        label="Filename (must be unique): "
                        name="titleFilename"
                        value={this.state.currentFilename}
                        id={this.state.currentId}
                        onChange={this.handleFilenameChange}/>
                    <ToolbarButton
                        elementId="buttonSave"
                        label="Save"
                        onClick={() => this.handleClick("save")} />
                    <ToolbarButton
                        elementId="buttonClear"
                        label="Clear (new document)"
                        onClick={() => this.handleClick("clear")} />
                    <p>Load document:</p>
                    <DropDown
                        elementId="fileDropdown"
                        docList={this.state.allDocuments}
                        onChange={this.handleDropDownChange}/>
                    <ToolbarButton
                        elementId="buttonLoad"
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
                    onChange={(ev) => this.handleContentChange(ev)}/>
                </div>
            </div>
        );
    }

    componentDidMount = () => {
        this._isMounted = true;
        if (this._isMounted) {
            backend("readall", this.afterReadAll);

            socket.on('connect', () => {
                socket.on('sendContent', (content) => {
                    this._wasWrittenLocally = false;
                    this.setState({
                        currentContent: content
                    });
                });
            });
        }
    }

    componentWillUnmount = () => {
       this._isMounted = false;
    }
}

export default App;
