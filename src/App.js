import React from 'react';
import ReactDOM from 'react-dom';
import ReactQuill from 'react-quill';
import DropDown from './components/DropDown.js';
import HeaderIcon from './components/HeaderIcon.js';
import LoginModal from './components/LoginModal.js';
import RegisterModal from './components/RegisterModal.js';
import ShareModal from './components/ShareModal.js';
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
        this._activateShareIcon = false;

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
            allFilenames: [],
            accountLinkText: "Login/register",
            message: 'Ready to create a new document.'
        };

        this.handleTextInputChange = this.handleTextInputChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    afterReadAll = (data) => {
        if (!data.tokenIsVerified) {
            this.setState({
                message: "Token invalid. Session has expired/false token."
            });
            return;
        }

        if (this._isMounted) {
            this.setState({
                allFilenames: data.allFilenames
            });
        }
        if (this.state.allFilenames.length > 0) {
            this.setState({
                selectedFile: this.state.allFilenames[0]
            });
        }
        return;
    }

    afterReadOne = (data) => {
        if (!data.tokenIsVerified) {
            this.setState({
                message: "Token invalid. Session has expired/false token."
            });
            return;
        }

        let filename = this.state.selectedFile;
        this.switchRoom(filename);
        this._isSaved = true;
        this.setState({
            currentFilename: filename,
            currentOwnerName: data.ownerName,
            currentOwnerEmail: data.ownerEmail,
            currentTitle: data.title,
            currentContent: data.content,
            currentAllowedUsers: data.allowedusers,
            message: `Loaded document "${filename}" from database.`
        }, () => {
            if (this.state.currentOwnerEmail === this.state.currentUserEmail) {
                this._activateShareIcon = true;
            } else {
                this._activateShareIcon = false;
            }
        });
    }

    afterCreateDoc = (data) => {

        if (!data.tokenIsVerified) {
            this.setState({
                message: "Token invalid. Session has expired/false token."
            });
            return;
        }

        if (data.acknowledged) {
            this._isSaved = true;
            this._activateShareIcon = true;
            this.switchRoom(this.state.currentFilename);
            let ownerName = this.state.currentUserName;
            let ownerEmail = this.state.currentUserEmail;
            this.setState({
                currentOwnerName: ownerName,
                currentOwnerEmail: ownerEmail,
                message: "Document saved to database."
            });

            let params = {
                token: this.state.token,
                email: this.state.currentUserEmail
            };
            backend(
                "readall",
                ENDPOINT,
                this.afterReadAll,
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
        if (!data.tokenIsVerified) {
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
        //If _isSaved flag isn't set, the document gets created in the db
        if ((action === "save") && (!this._isSaved)) {
            backend(
                "create",
                ENDPOINT,
                this.afterCreateDoc, {
                    token: this.state.token,
                    filename: this.state.currentFilename,
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
            this._activateShareIcon = false;
            let name = this.state.currentUserName;
            let email = this.state.currentUserEmail;
            this.setState({
                currentOwnerName: name,
                currentOwnerEmail: email,
                currentFilename: '',
                currentTitle: '',
                currentContent: '',
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
        if ((data.email.length === 0) || (data.name.length === 0) || (data.name.length === 0)) {
            this.setState({
                message: `All fields must be filled out. Try again.`
            });
            return;
        }
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
        console.log(data);
        this.setState({
            message: `After register user. Ready to log in!`
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
            ReactDOM.render(
                <ShareModal
                    allowedUsers={this.state.currentAllowedUsers}
                    shareModal={this.shareModal}
                    changeAllowedUsers={this.changeAllowedUsers}/>,
                document.getElementById('manage-allowed-users')
            )
            return;
        }

        ReactDOM.unmountComponentAtNode(
            document.getElementById('manage-allowed-users')
        );
    }

    changeAllowedUsers = (data) => {
        console.log(data);
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
            allFilenames: [],
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
                    email: data.email
                };
                backend(
                    "readall",
                    ENDPOINT,
                    this.afterReadAll,
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
                            active="true"
                            label="Comment"
                            onClick={this.handleComment}/>
                        <HeaderIcon
                            elementId="codeicon"
                            icon="code"
                            active="true"
                            label="Code"
                            onClick={this.handleCode}/>
                        <HeaderIcon
                            elementId="pdficon"
                            icon="print"
                            active="true"
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
                    <div className="flex-column">
                        <>
                        <div className="field-title">Logged in as:</div>
                        <div className="field-title">{this.state.currentUserEmail}</div>
                        </>
                    </div>
                    <ul className="flex-row header-menu">
                        <HeaderIcon
                            elementId="shareicon"
                            icon="group_add"
                            active={this._activateShareIcon}
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
                <TextInputField
                    elementId="titleInputField"
                    label="Title"
                    name="docInfoTitle"
                    value={this.state.currentTitle}
                    saved={this._isSaved}
                    onChange={this.handleTextInputChange}/>
                <div className="flex-row owner-wrapper">
                    Document owner: {this.state.currentOwnerName} ({this.state.currentOwnerEmail})
                </div>
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
                    <div id="manage-allowed-users"></div>
                    <div className="flex-row align-items-end">
                        <TextInputField
                            elementId="filenameInputField"
                            label="Filename (must be unique)"
                            name="docInfoFilename"
                            value={this.state.currentFilename}
                            saved={this._isSaved}
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
