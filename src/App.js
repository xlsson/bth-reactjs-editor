import React from 'react';
import ReactDOM from 'react-dom';
import ReactQuill from 'react-quill';
import {UnControlled as CodeMirror} from 'react-codemirror2';
import CodeModeBox from './components/CodeModeBox.js';
import DropDown from './components/DropDown.js';
import HeaderIcon from './components/HeaderIcon.js';
import LoginModal from './components/LoginModal.js';
import RegisterModal from './components/RegisterModal.js';
import ShareModal from './components/ShareModal.js';
import StatusField from './components/StatusField.js';
import TextInputField from './components/TextInputField.js';
import Button from './components/Button.js';

import backend from './functions/Backend.js';
import pdfPrint from './functions/PdfPrint.js';
import socketIOClient from "socket.io-client";

import 'react-quill/dist/quill.bubble.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
require('codemirror/mode/javascript/javascript');

// const ENDPOINT = "http://localhost:1234";
const ENDPOINT = "https://jsramverk-editor-riax20.azurewebsites.net";
const socket = socketIOClient(ENDPOINT);

class App extends React.Component {
    constructor(props) {
        super(props);

        this._isMounted = false;
        this._isFromRemote = false;
        this._isSaved = false;

        this.state = {
            token: '',
            currentUserName: '',
            currentUserEmail: '',
            currentFilename: '',
            currentOwnerName: '',
            currentOwnerEmail: '',
            currentTitle: '',
            currentContent: '',
            currentAllowedUsers: [],
            selectedFile: '',
            allowedDocs: [],
            activateShareIcon: false,
            codeMode: false,
            codeOutput: "",
            accountLinkText: "Login/register",
            message: 'Ready to create a new document.'
        };

    }

    // Checks that email is a valid e-mail address
    checkEmailValid = (email) => {
        const regex = new RegExp(/^[a-zA-Z0-9]+@(?:[a-zA-Z0-9]+\.)+[A-Za-z]+$/);
        const emailIsValid = regex.test(email);

        return emailIsValid;
    }

    afterGetAllowedDocs = (data) => {
        if (data.tokenNotValid) {
            this.setState({
                message: "Token invalid. Session has expired/false token."
            });
            return;
        }

        if (this._isMounted) {
            this.setState({
                allowedDocs: data.data.allowedDocs
            });
        }
        if (this.state.allowedDocs.length > 0) {
            this.setState({
                selectedFile: this.state.allowedDocs[0].filename
            });
        }
        return;
    }

    afterReadOne = (data) => {
        if (data.tokenNotValid) {
            this.setState({
                message: "Token invalid. Session has expired/false token."
            });
            return;
        }

        let doc = data.data.doc;

        this.switchRoom(doc.filename);
        this._isSaved = true;
        this.setState({
            currentFilename: doc.filename,
            currentOwnerName: doc.ownerName,
            currentOwnerEmail: doc.ownerEmail,
            currentTitle: doc.title,
            currentContent: doc.content,
            currentAllowedUsers: doc.allowedusers,
            message: `Loaded document "${doc.filename}" from database.`
        }, () => {
            if (this.state.currentOwnerEmail === this.state.currentUserEmail) {
                this.setState({
                    activateShareIcon: true
                });
            } else {
                this.setState({
                    activateShareIcon: false
                });
            }
        });
    }

    afterCreateDoc = (data) => {

        if (data.tokenNotValid) {
            this.setState({
                message: "Token invalid. Session has expired/false token."
            });
            return;
        }

        if (data.acknowledged) {
            this._isSaved = true;
            this.switchRoom(this.state.currentFilename);
            let ownerName = this.state.currentUserName;
            let ownerEmail = this.state.currentUserEmail;
            this.setState({
                currentOwnerName: ownerName,
                currentOwnerEmail: ownerEmail,
                activateShareIcon: true,
                message: "Document saved to database."
            });

            let params = {
                token: this.state.token,
                email: this.state.currentUserEmail,
                code: this.state.codeMode
            };
            backend(
                "alloweddocs",
                ENDPOINT,
                this.afterGetAllowedDocs,
                params
            );
            return;
        }

        this.setState({
            message: "Filename already exists. Choose another name."
        });

        return;
    }

    afterUpdate = (data) => {
        if (data.tokenNotValid) {
            this.setState({
                message: "Token invalid. Session has expired/false token."
            });
            return;
        }

        this.setState({ message: "Changes saved to database." });
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
        //If user is not logged in, clicking save instead opens login window
        if ((action === "save") && (this.state.token.length === 0)) {
            this.loginModal("open");
            return;
        };

        //If filename is blank, do not save
        if ((action === "save") && (this.state.currentFilename.length === 0)) {
            this.setState({
                message: `Not saved. Filename cannot be blank.`
            });
            return;
        };

        //If _isSaved flag isn't set, the document gets created in the db
        if ((action === "save") && (!this._isSaved)) {
            backend(
                "create",
                ENDPOINT,
                this.afterCreateDoc, {
                    token: this.state.token,
                    filename: this.state.currentFilename,
                    code: this.state.codeMode,
                    title: this.state.currentTitle,
                    content: this.state.currentContent,
                    email: this.state.currentUserEmail
                 }
            );
            return;
        }
        //If _isSaved flag is set, the document gets updated in the db
        if ((action === "save") && (this._isSaved)) {
            backend(
                "update",
                ENDPOINT,
                this.afterUpdate, {
                    token: this.state.token,
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
            let name = this.state.currentUserName;
            let email = this.state.currentUserEmail;
            this.setState({
                currentOwnerName: name,
                currentOwnerEmail: email,
                currentFilename: '',
                currentTitle: '',
                currentContent: '',
                activateShareIcon: false,
                message: `Cleared. Ready to create a new document.`
            });
            return;
        }

        if ((action === "load") && (this.state.token.length > 0)) {

            let params = {
                token: this.state.token,
                filename: this.state.selectedFile
            };
            backend(
                "readone",
                ENDPOINT,
                this.afterReadOne,
                params
            );
            return;
        }
    }

    switchRoom = (newRoom) => {
        socket.emit("leave", this.state.currentFilename);
        socket.emit("join", newRoom);
    }

    registerModal = (action) => {

        if (action === "open") {
            ReactDOM.render(
                <RegisterModal
                    registerModal={this.registerModal}
                    checkEmailValid={this.checkEmailValid}
                    loginModal={this.loginModal}
                    loginAttempt={this.loginAttempt}
                    registerUser={this.registerUser}/>,
                document.getElementById('modal')
            );
            return;
        }

        ReactDOM.unmountComponentAtNode(
            document.getElementById('modal')
        );
    }

    registerUser = (data) => {
        let params = {
            email: data.email,
            name: data.name,
            password: data.password,
        };
        backend(
            "createuser",
            ENDPOINT,
            this.afterRegisterUser,
            params
        );
    }

    afterRegisterUser = (data) => {
        this.setState({
            message: `User has been registered. Ready to log in!`
        });
    }

    loginModal = (action) => {
        //If something is stored in token, click means logout
        if (this.state.token.length > 0) {
            this.clearStateAfterLogout();
            return;
        }

        if (action === "open") {
            ReactDOM.render(
                <LoginModal
                    loginModal={this.loginModal}
                    loginAttempt={this.loginAttempt}
                    registerModal={this.registerModal}/>,
                document.getElementById('modal')
            );
            return;
        }

        ReactDOM.unmountComponentAtNode(
            document.getElementById('modal')
        );
    }

    shareModal = (action) => {
        if (action === "open") {
            let params = {
                token: this.state.token
            };
            backend(
                "allusers",
                ENDPOINT,
                this.openShareModal,
                params
            );
            return;
        }

        ReactDOM.unmountComponentAtNode(
            document.getElementById('manage-allowed-users')
        );
    }

    openShareModal = (data) => {
        let allUsers = data.data.users;

        ReactDOM.render(
            <ShareModal
                allUsers={allUsers}
                allowedUsers={this.state.currentAllowedUsers}
                currentUserEmail={this.state.currentUserEmail}
                checkEmailValid={this.checkEmailValid}
                shareModal={this.shareModal}
                sendInvite={this.sendInvite}
                updateUsers={this.updateUsers}/>,
            document.getElementById('manage-allowed-users')
        )
    }

    updateUsers = (data) => {
        let params = {
            token: this.state.token,
            filename: this.state.currentFilename,
            allowedusers: data
        };
        backend(
            "updateusers",
            ENDPOINT,
            this.afterUpdateUsers,
            params
        );
    }

    afterUpdateUsers = (data) => {
        this.setState({
            currentAllowedUsers: data.allowedusers,
            message: "List of allowed users has been updated."
        });
    }

    sendInvite = (recipient) => {
        console.log("send invite to: ", recipient);
        console.log("overwritten with richard.axelsson@... during development");
        let params = {
            token: this.state.token,
            recipient: "richard.axelsson@gmail.com",
            inviterName: this.state.currentUserName,
            inviterEmail: this.state.currentUserEmail,
            filename: this.state.currentFilename,
            title: this.state.currentTitle
        };
        backend(
            "sendinvite",
            ENDPOINT,
            this.afterInvite,
            params
        );
    }

    afterInvite = (data) => {
        // Lägg till en message box?
        console.log("after invite: ", data.inviteSent);
    }

    clearStateAfterLogout = () => {
        this._isSaved = false;
        this.setState({
            token: '',
            currentUserName: '',
            currentUserEmail: '',
            currentFilename: '',
            currentOwnerName: '',
            currentOwnerEmail: '',
            currentAllowedUsers: [],
            selectedFile: '',
            allowedDocs: [],
            activateShareIcon: false,
            codeMode: false,
            accountLinkText: "Login/register",
            message: 'Logged out'
        });
    }

    loginAttempt = (email, password) => {
        let params = {
            email: email,
            password: password,
        };
        backend(
            "verifylogin",
            ENDPOINT,
            this.afterLoginAttempt,
            params
        );
    }

    afterLoginAttempt = (data) => {
        if (data.userexists && data.verified) {
            // Saves token in state if login is successful
            this.setState({
                token: data.token,
                currentUserEmail: data.email,
                currentUserName: data.name,
                accountLinkText: "Logout",
                message: `Successful login.`
            }, () => {
                let params = {
                    token: data.token,
                    email: data.email,
                    code: this.state.codeMode
                };
                backend(
                    "alloweddocs",
                    ENDPOINT,
                    this.afterGetAllowedDocs,
                    params
                );
            });
            return;
        }

        if (data.userexists && !data.verified) {
            this.setState({
                message: `Wrong password. Please try again.`
            });
            return;
        }

        this.setState({
            message: `User does not exist. Please register first.`
        });
        return;
    }

    handlePdfPrint = () => {
        pdfPrint(
            this.state.currentTitle,
            this.state.currentContent,
            ENDPOINT
        );
    }

    toggleCodeMode = () => {
        // Set codeMode to opposite value of the current value
        let codeMode = !this.state.codeMode;

        // Clear all state except login details: user email, name and token
        this._isSaved = false;
        this.setState({
            codeMode: codeMode,
            codeOutput: '',
            currentFilename: '',
            currentTitle: '',
            currentContent: '',
            currentOwnerName: '',
            currentOwnerEmail: '',
            currentAllowedUsers: [],
            selectedFile: '',
            allowedDocs: [],
            activateShareIcon: false
        }, () => {
            if (this.state.token) {
                // get all documents where user is allowed, based on mode
                let params = {
                    token: this.state.token,
                    email: this.state.currentUserEmail,
                    code: this.state.codeMode
                };
                backend(
                    "alloweddocs",
                    ENDPOINT,
                    this.afterGetAllowedDocs,
                    params
                );
            }
        });
    }

    renderQuill = () => {
        return (
            <div className="editor-container">
                <ReactQuill
                    theme="bubble"
                    value={this.state.currentContent}
                    onChange={(ev) => this.handleTextInputChange(ev, "content")}/>
            </div>
        );
    }

    renderCodeMirror = () => {
        return (
            <>
            <div className="editor-container code-editor">
                <CodeMirror
                    value={this.state.currentContent}
                    options={{
                        mode: 'javascript',
                        theme: 'material',
                        lineNumbers: true
                    }}
                    onChange={(editor, data, value) => this.handleTextInputChange(value, "content")}/>
            </div>
            <div className="field-title">Output</div>
            <div className="code-editor-result">
                {this.state.codeOutput}
            </div>
            </>
        );
    }

    executeCode = () => {
        let base64code = btoa(this.state.currentContent);
        let params = {
            code: base64code
        };
        backend(
            "execute",
            ENDPOINT,
            this.afterExecuteCode,
            params
        );
        return;
    }

    afterExecuteCode = (data) => {
        let result = atob(data.data);
        this.setState({
            codeOutput: result
        });
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
                    <div className="logo">CirrusDocs</div>
                    <StatusField
                        currentUserEmail={this.state.currentUserEmail}
                        currentOwnerEmail={this.state.currentOwnerEmail}/>
                    <ul className="flex-row header-menu">
                        <HeaderIcon
                            elementId="pdficon"
                            icon="print"
                            active={true}
                            label="PDF"
                            onClick={this.handlePdfPrint}/>
                        <HeaderIcon
                            elementId="shareicon"
                            icon="group_add"
                            active={this.state.activateShareIcon}
                            label="Share"
                            onClick={this.shareModal}/>
                        <HeaderIcon
                            elementId="accounticon"
                            icon="account_circle"
                            active="true"
                            label={this.state.accountLinkText}
                            onClick={() => this.loginModal("open")}/>
                    </ul>
                    </>
                </div>
                <div className="flex-row load-save-bar">
                    <>
                    <Button
                        classes="lighter"
                        elementId="buttonClear"
                        label="NEW (CLEAR)"
                        onClick={() => this.handleClick("clear")} />
                    <div className="flex-row align-items-end">
                        <>
                        <DropDown
                            title="Open a document"
                            elementId="fileDropdown"
                            availableFiles={this.state.allowedDocs}
                            onChange={this.handleDropDownChange}/>
                        <Button
                            classes=""
                            elementId="buttonLoad"
                            label="OPEN"
                            onClick={() => this.handleClick("load")} />
                        </>
                    </div>
                    <div className="flex-row align-items-end">
                        <TextInputField
                            elementId="filenameInputField"
                            label="Filename"
                            name="docInfoFilename"
                            value={this.state.currentFilename}
                            saved={this._isSaved}
                            onChange={this.handleTextInputChange}/>
                        <Button
                            classes="red"
                            elementId="buttonSave"
                            label="SAVE"
                            onClick={() => this.handleClick("save")} />
                    </div>
                    </>
                </div>
                <TextInputField
                    elementId="titleInputField"
                    label="Document title"
                    name="docInfoTitle"
                    value={this.state.currentTitle}
                    saved={this._isSaved}
                    onChange={this.handleTextInputChange}/>
                {!this.state.codeMode && this.renderQuill()}
                {this.state.codeMode && this.renderCodeMirror()}
                <div className="toolbar">
                    <>
                    <ul className="flex-row middle-icons">
                        <HeaderIcon
                            elementId="commentofficon"
                            icon="visibility_off"
                            active={false}
                            label="Show/hide"
                            onClick={this.handleComment}/>
                        <HeaderIcon
                            elementId="commenticon"
                            icon="comment"
                            active={false}
                            label="New comment"
                            onClick={this.handleComment}/>
                    </ul>
                    <div id="manage-allowed-users"></div>
                    <CodeModeBox
                        elementId="codemodebox"
                        active={this.state.codeMode}
                        toggle={this.toggleCodeMode}
                        execute={this.executeCode}/>
                    </>
                </div>
                <div className="message-box">
                    {this.state.message}
                </div>
                <div id="modal"></div>
                </>
            </div>
        );
    }

    componentDidMount = () => {
        this._isMounted = true;
        if (this._isMounted) {
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
