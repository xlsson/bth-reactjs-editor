import React from 'react';
import ReactDOM from 'react-dom';
import ReactQuill from 'react-quill';
import DropDown from './components/DropDown.js';
import HeaderIcon from './components/HeaderIcon.js';
import LoginModal from './components/LoginModal.js';
import TextInputField from './components/TextInputField.js';
import ToolbarButton from './components/ToolbarButton.js';
import backend from './functions/Backend.js';
import socketIOClient from "socket.io-client";

import 'react-quill/dist/quill.bubble.css';

const ENDPOINT = "https://jsramverk-editor-riax20.azurewebsites.net";
const socket = socketIOClient(ENDPOINT);

class App extends React.Component {
    constructor(props) {
        super(props);

        this._isMounted = false;

        this._isFromRemote = false;

        this._isSaved = false;

        this.state = {
            currentUser: 'richard.axelsson@gmail.com',
            currentId: '',
            currentFilename: '',
            currentOwner: '',
            currentOwnerEmail: '',
            currentTitle: '',
            currentContent: '',
            currentAllowedUsers: [],
            selectedFile: '',
            allFilenames: [],
            latestMessage: 'Ready to create a new document.'
        };

        this.handleTextInputChange = this.handleTextInputChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    afterReadAll = (data) => {
        if (this._isMounted) {
            this.setState({
                allFilenames: data
            });
        }
        if (this.state.allFilenames.length > 0) {
            this.setState({
                selectedFile: this.state.allFilenames[0]
            });
        }
    }

    afterReadOne = (doc) => {
        let filename = this.state.selectedFile;
        this.switchRoom(filename);
        this._isSaved = true;
        this.setState({
            currentFilename: filename,
            currentOwner: doc.ownerName,
            currentOwnerEmail: doc.ownerEmail,
            currentTitle: doc.title,
            currentContent: doc.content,
            currentAllowedUsers: doc.allowedusers,
            latestMessage: `Loaded document "${filename}" from database.`
        });
    }

    afterCreateDoc = (data) => {
        let doc = data[0];

        if (doc.exists === "false") {
            this._isSaved = true;
            this.switchRoom(doc.insertedId);
            this.setState({
                currentId: doc.insertedId,
                latestMessage: "Document saved to database."
            });

            let params = { email: this.state.currentUser };
            backend(
                "readall",
                ENDPOINT,
                this.afterReadAll,
                params
            );
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

        if (!this._isSaved) { return; }

        data.room = this.state.currentFilename;
        socket.emit("send", data);
        return;
    }

    handleDropDownChange = (filename) => {
        this.setState({
            selectedFile: filename
        });
    }

    handleClick = (action) => {
        if ((action === "save") && (!this._isSaved)) {
            backend(
                "create",
                ENDPOINT,
                this.afterCreateDoc, {
                    filename: this.state.currentFilename,
                    title: this.state.currentTitle,
                    content: this.state.currentContent,
                    email: this.state.currentUser
                 }
            );
            return;
        }

        if ((action === "save") && (this._isSaved)) {
            backend(
                "update",
                ENDPOINT,
                this.afterUpdate, {
                    filename: this.state.currentFilename,
                    title: this.state.currentTitle,
                    content: this.state.currentContent,
                 }
            );
            return;
        }

        if (action === "clear") {
            socket.emit("leave", this.state.currentFilename);
            this._isSaved = false;
            this.setState({
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
                { filename: this.state.selectedFile }
            );
            return;
        }
    }

    switchRoom = (newRoom) => {
        socket.emit("leave", this.state.currentFilename);
        socket.emit("join", newRoom);
    }

    toggleLoginModal = (action) => {
        if (action === "open") {
            ReactDOM.render(
                <LoginModal
                    onClick={this.toggleLoginModal}/>,
                document.getElementById('login-modal')
            );
            return;
        }
        ReactDOM.unmountComponentAtNode(
            document.getElementById('login-modal')
        );
    }

    handlePdf = () => {
        console.log("handlePdf");
    }

    handleCode = () => {
        console.log("handleCode");
    }

    handleShare = () => {
        console.log("handleShare");
    }

    handleComment = () => {
        console.log("handleComment");
    }

    render() {
        return (
            <div className="App">
                <>
                <div className="flex-row header-wrapper">
                    <>
                    <ul className="flex-row header-menu">
                        <>
                        <HeaderIcon
                            elementId="commenticon"
                            icon="comment_bank"
                            label="Comment"
                            onClick={this.handleComment}/>
                        <HeaderIcon
                            elementId="shareicon"
                            icon="group_add"
                            label="Share"
                            onClick={this.handleShare}/>
                        <HeaderIcon
                            elementId="codeicon"
                            icon="code"
                            label="Code"
                            onClick={this.handleCode}/>
                        <HeaderIcon
                            elementId="pdficon"
                            icon="print"
                            label="PDF"
                            onClick={this.handlePdf}/>
                        </>
                    </ul>
                    <div className="flex-row align-items-end">
                        <>
                        <DropDown
                            title="Open a document"
                            elementId="fileDropdown"
                            availableFiles={this.state.allFilenames}
                            onChange={this.handleDropDownChange}/>
                        <ToolbarButton
                            classes=""
                            elementId="buttonLoad"
                            label="OPEN"
                            onClick={() => this.handleClick("load")} />
                        </>
                    </div>
                    <ul className="flex-row header-menu">
                        <HeaderIcon
                            elementId="accounticon"
                            icon="account_circle"
                            label="Login"
                            onClick={() => this.toggleLoginModal("open")}/>
                    </ul>
                    </>
                </div>
                <TextInputField
                    elementId="titleInputField"
                    label="Title"
                    name="docInfoTitle"
                    value={this.state.currentTitle}
                    saved={this._isSaved}
                    id={this.state.currentId}
                    onChange={this.handleTextInputChange}/>
                <div className="editorContainer">
                    <ReactQuill
                    theme="bubble"
                    value={this.state.currentContent}
                    onChange={(ev) => this.handleTextInputChange(ev, "content")}/>
                </div>
                <div className="toolbar">
                    <>
                    <ToolbarButton
                        classes="lighter"
                        elementId="buttonClear"
                        label="NEW (CLEAR)"
                        onClick={() => this.handleClick("clear")} />
                    <div className="flex-row align-items-end">
                        <TextInputField
                            elementId="filenameInputField"
                            label="Filename (must be unique)"
                            name="docInfoFilename"
                            value={this.state.currentFilename}
                            saved={this._isSaved}
                            id={this.state.currentId}
                            onChange={this.handleTextInputChange}/>
                        <ToolbarButton
                            classes="red"
                            elementId="buttonSave"
                            label="SAVE"
                            onClick={() => this.handleClick("save")} />
                    </div>
                    </>
                </div>
                <div className="message-box">
                    >>> {this.state.latestMessage}
                </div>
                <div id="login-modal"></div>
                </>
            </div>
        );
    }

    componentDidMount = () => {
        this._isMounted = true;
        if (this._isMounted) {
            let params = { email: this.state.currentUser };
            backend(
                "readall",
                ENDPOINT,
                this.afterReadAll,
                params
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
