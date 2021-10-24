import React from 'react';
import ReactDOM from 'react-dom';
import { Editor as TinyMCE } from '@tinymce/tinymce-react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import CommentBox from './components/CommentBox.js';
import FlashMessage from './components/FlashMessage.js';
import CodeModeBox from './components/CodeModeBox.js';
import FilesDropDown from './components/FilesDropDown.js';
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


import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/neo.css';

require('codemirror/mode/javascript/javascript');

const ENDPOINT = "https://jsramverk-editor-riax20.azurewebsites.net";
const socket = socketIOClient(ENDPOINT);

class App extends React.Component {
    constructor(props) {
        super(props);

        this._isMounted = false;
        this._isFromRemote = false;
        this._isSaved = false;
        this._editor = null;

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
            hideComments: true,
            codeOutput: "",
            currentComments: [],
            accountLinkText: "Login/register",
            message: {
                text: "",
                type: "hidden"
            }
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
            this.setFlashMessage({
                text: "Token invalid. Session has expired/false token.",
                type: "error"
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
            this.setFlashMessage({
                text: "Token invalid. Session has expired/false token.",
                type: "error"
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
            currentComments: [],
            message: {
                text: `Loaded document "${doc.filename}" from database.`,
                type: "ok"
            }
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
            this.setFlashMessage({
                text: "Token invalid. Session has expired/false token.",
                type: "error"
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
                message: {
                    text: "Document saved to database.",
                    type: "ok"
                }
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

        this.setFlashMessage({
            text: "Filename already exists. Choose another name.",
            type: "error"
        });
        return;
    }

    afterUpdate = (data) => {
        if (data.tokenNotValid) {
            this.setFlashMessage({
                text: "Token invalid. Session has expired/false token.",
                type: "error"
            });
            return;
        }

        this.setFlashMessage({
            text: "Changes saved to database.",
            type: "ok"
        });
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
            this.setState({
                currentContent: ev
            }, () => {
                console.log(this.state.currentContent);
            });
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

            this.setFlashMessage({
                text: "Not saved. Filename cannot be blank.",
                type: "error"
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
            this.setState({
                currentOwnerName: name,
                currentOwnerEmail: '',
                currentFilename: '',
                currentTitle: '',
                currentContent: '',
                activateShareIcon: false,
                currentComments: [],
                message: {
                    text: "Cleared. Ready to create a new document.",
                    type: "ok"
                }
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
        this.setFlashMessage({
            text: "User succesfully registered. Ready to log in!",
            type: "ok"
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
            message: {
                text: "Editing rights have been updated.",
                type: "ok"
            }
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
            message: {
                text: "Logged out.",
                type: "ok"
            }
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
                message: {
                    text: "Successful login.",
                    type: "ok"
                }
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
            this.setFlashMessage({
                text: "Wrong password. Please try again.",
                type: "error"
            });
            return;
        }

        this.setFlashMessage({
            text: "User does not exist. Please try again.",
            type: "error"
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

    // Adds a comment to the content
    addCommentToContent = (allComments) => {
        // Get the latest = highest comment nr
        let commentId = allComments.at(-1).nr;

        let hidden = ``;
        if (this.state.hideComments) { hidden = `hidden="true"`; }

        let commentTag = `
         <span class="comment" id="comment${commentId}" style="color: #f00;" ${hidden}>
        [${commentId}]</span> `;

        this._editor.execCommand('mceInsertContent', false, commentTag);

        this.setState({
            currentComments: allComments
        });

        return;
    }

    toggleShowComments = () => {
        this.setState({
            hideComments: !this.state.hideComments
        }, () => {
            this.cleanUpComments(this.toggleCommentsCallback);
        });
    }

    // Removes any comments not found in document from comments array
    cleanUpComments = (callback) => {
        // Make callback param optional
        callback = callback || function(){};

        let comments = this.state.currentComments;

        let commentsNew = [];
        let commentNode;

        console.log(comments);

        comments.forEach((comment, i) => {
            commentNode = this._editor.dom.get(`comment${comment.nr}`);
            if (commentNode) { commentsNew.push(comment); }
        });

        this.setState({
            currentComments: commentsNew
        }, () => { callback(); });
    }

    toggleCommentsCallback = () => {
        let comments = this.state.currentComments;
        let commentNode;

        comments.forEach((comment, i) => {
            commentNode = this._editor.dom.get(`comment${comment.nr}`);
            commentNode.hidden = this.state.hideComments;
        });
    }

    setFlashMessage = (message={ text: "", type: "hidden" }) => {
        this.setState({
            message: message
        });
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

    renderTinyMCE = () => {
        return (
            <div className="editor-container">
                <TinyMCE
                    initialValue=""
                    value={this.state.currentContent}
                    apiKey="tibczi1j1cdn33o7j2t8sckurdpakkzfp7ma52oha6f4qy11"
                    init={{
                        height: 500,
                        menubar: false,
                        plugins: [
                            'advlist autolink lists link image',
                            'charmap print preview anchor help',
                            'searchreplace visualblocks code',
                            'insertdatetime media table paste wordcount'
                        ],
                        toolbar:
                            'undo redo | formatselect | bold italic | \
                            alignleft aligncenter alignright | \
                            bullist numlist outdent indent | help',
                      setup: (editor) => {
                          this._editor = editor;
                      }
                    }}
                    onEditorChange={(ev) => this.handleTextInputChange(ev, "content")}/>
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
                        theme: 'neo',
                        lineNumbers: true
                    }}
                    onBeforeChange={(editor, data, value) =>
                        this.handleTextInputChange(value, "content", editor)}/>
            </div>
            <div className="field-title">Output</div>
            <div className="code-editor-result">
                {this.state.codeOutput}
            </div>
            </>
        );
    }

    render() {
        return (
            <div className="App">
                <>
                <div className="flex-row header-wrapper">
                    <>
                    <div className="logo"></div>
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
                        <FilesDropDown
                            elementId="fileDropdown"
                            codeMode={this.state.codeMode}
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
                <FlashMessage
                    message={this.state.message}/>
                <TextInputField
                    elementId="titleInputField"
                    label="Document title"
                    name="docInfoTitle"
                    value={this.state.currentTitle}
                    saved={this._isSaved}
                    onChange={this.handleTextInputChange}/>
                {!this.state.codeMode && this.renderTinyMCE()}
                {this.state.codeMode && this.renderCodeMirror()}
                <div className="toolbar">
                    <>
                    <CommentBox
                        content={this.state.currentContent}
                        comments={this.state.currentComments}
                        commentsAreHidden={this.state.hideComments}
                        toggleShowComments={this.toggleShowComments}
                        addCommentToContent={this.addCommentToContent}
                        cleanUpComments={this.cleanUpComments}
                        codeMode={this.state.codeMode}
                        setFlashMessage={this.setFlashMessage}/>
                    <div id="manage-allowed-users"></div>
                    <CodeModeBox
                        elementId="codemodebox"
                        active={this.state.codeMode}
                        toggle={this.toggleCodeMode}
                        execute={this.executeCode}/>
                    </>
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
