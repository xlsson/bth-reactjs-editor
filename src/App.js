import React from 'react';
import ReactQuill from 'react-quill';
import ToolbarButton from './components/ToolbarButton.js';
import TextInputField from './components/TextInputField.js';
import DropDown from './components/DropDown.js';
import backend from './functions/Backend.js';
import socketIOClient from "socket.io-client";

import './App.css';
import 'react-quill/dist/quill.bubble.css';

const ENDPOINT = "http://localhost:1234";
const socket = socketIOClient(ENDPOINT);

class App extends React.Component {
    constructor(props) {
        super(props);

        this._isMounted = false;

        this._isFromRemote = false;

        this.state = {
            currentId: '',
            currentFilename: '',
            currentTitle: '',
            currentContent: '',
            selectedDocId: '',
            allDocuments: [],
            latestMessage: 'Ready to create a new document.'
        };

        this.handleTextInputChange = this.handleTextInputChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    afterReadAll = (data) => {
        if (this._isMounted) {
            this.setState({
                allDocuments: data
            });
        }
        if (this.state.allDocuments.length > 0) {
            this.setState({
                selectedDocId: this.state.allDocuments[0]._id
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
            latestMessage: `Loaded document "${doc.filename}" from database.`
        });
    }

    afterCreateDoc = (data) => {
        let doc = data[0];

        if (doc.exists === "false") {
            this.switchRoom(doc.insertedId);
            this.setState({
                currentId: doc.insertedId,
                latestMessage: "Document saved to database."
            });

            backend("readall", ENDPOINT, this.afterReadAll);
            return;
        }

        this.setState({
            latestMessage: "Filename already exists. Choose another name."
        });

        return;
    }

    afterUpdate = (data) => {
        this.setState({ latestMessage: "Changes saved to database." });
        return;
    }

    handleTextInputChange = (ev, fieldName) => {
        let data = {};

        if (this._isFromRemote) {
            this._isFromRemote = false;
            return;
        }

        if (fieldName === "docInfoFilename") {
            this.setState({ currentFilename: ev });
            return;
        }

        if (fieldName === "content") {
            this.setState({ currentContent: ev });
            data.title = this.state.currentTitle;
            data.content = ev;
        } else if (fieldName === "docInfoTitle") {
            this.setState({ currentTitle: ev });
            data.title = ev;
            data.content = this.state.currentContent;
        }

        if (this.state.currentId.length === 0) { return; }

        data.room = this.state.currentId;
        socket.emit("send", data);
        return;
    }

    handleDropDownChange = (documentid) => {
        this.setState({
            selectedDocId: documentid
        });
    }

    handleClick = (action) => {
        if ((action === "save") && (this.state.currentId.length === 0)) {
            backend(
                "create",
                ENDPOINT,
                this.afterCreateDoc, {
                    filename: this.state.currentFilename,
                    title: this.state.currentTitle,
                    content: this.state.currentContent,
                 }
            );
            return;
        }

        if ((action === "save") && (this.state.currentId.length > 0)) {
            backend(
                "update",
                ENDPOINT,
                this.afterUpdate, {
                    docid: this.state.currentId,
                    title: this.state.currentTitle,
                    content: this.state.currentContent,
                 }
            );
            return;
        }

        if (action === "clear") {
            socket.emit("leave", this.state.currentId);
            this.setState({
                currentId: '',
                currentFilename: '',
                currentTitle: '',
                currentContent: '',
                latestMessage: `Cleared. Ready to create a new document.`
            });
            return;
        }

        if (action === "load") {
            backend(
                "readone",
                ENDPOINT,
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
                        name="docInfoTitle"
                        value={this.state.currentTitle}
                        id={this.state.currentId}
                        onChange={this.handleTextInputChange}/>
                    <TextInputField
                        elementId="filenameInputField"
                        label="Filename (must be unique): "
                        name="docInfoFilename"
                        value={this.state.currentFilename}
                        id={this.state.currentId}
                        onChange={this.handleTextInputChange}/>
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
                        onClick={() => this.handleClick("load")} />
                </div>
                <div className="messageBox">
                    <strong>{this.state.latestMessage}</strong>
                </div>
                <div className="editorContainer">
                    <ReactQuill
                    theme="bubble"
                    value={this.state.currentContent}
                    onChange={(ev) => this.handleTextInputChange(ev, "content")}/>
                </div>
            </div>
        );
    }

    componentDidMount = () => {
        this._isMounted = true;
        if (this._isMounted) {
            backend(
                "readall",
                ENDPOINT,
                this.afterReadAll
            );

            socket.on('connect', () => {
                socket.on('send', (data) => {
                    this._isFromRemote = true;
                    this.setState({
                        currentTitle: data.title,
                        currentContent: data.content
                    });
                });
            });
        }
    }

    componentWillUnmount = () => {
       this._isMounted = false;
       socket.disconnect();
    }
}

export default App;
