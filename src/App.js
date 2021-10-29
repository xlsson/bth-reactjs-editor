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

/**
 * @type {string} ENDPOINT -    Base URL for the server
 * @type {object} socket -      socketIOClient instance
 */
const ENDPOINT = "https://jsramverk-editor-riax20.azurewebsites.net";
const socket = socketIOClient(ENDPOINT);

/**
 * App class = root component for the CirrusDocs app
 *
 * @component
 * @member {boolean} _isMounted -               True if the component is mounted
 * @member {boolean} _isFromRemote -            True if input comes from web socket
 * @member {boolean} _isSave -                  True if document is already saved in the db
 * @member {object} _editor -                   TinyMCE editor instance
 *
 * @member {object} state -                     State:
 * @member {string} state.token -               JSON web token
 * @member {string} state.currentUserName -     User name of logged in user
 * @member {string} state.currentUserEmail -    Email of logged in user
 * @member {string} state.currentFilename -     Filename of currently opened document
 * @member {string} state.currentOwnerName -    Owner name of currently opened document
 * @member {string} state.currentOwnerEmail -   Owner e-mail of currently opened document
 * @member {string} state.currentTitle -        Title of currently opened document
 * @member {string} state.currentContent -      Content of currently opened document
 * @member {array} state.currentAllowedUsers -  Array of users with editing rights
 *                                              for the currently opened document
 * @member {string} state.selectedFile -        The file last selected in the dropdown
 * @member {array} state.allowedDocs -          An array of all files where the
 *                                              logged in user has editing rights, for
 *                                              the current mode (code or text)
 * @member {boolean} state.activateShareIcon -  True if the user is allowed to
 *                                              manage editing rights
 * @member {boolean} state.codeMode -           True = code mode, false = text mode
 * @member {boolean} state.hideComments -       True = comments are displayed,
 *                                              false = comments are hidden
 * @member {string} state.codeOutput -          Result of sending code to the
 *                                              code API
 * @member {array} state.currentComments -      Array with all comments for the
 *                                              current document.
 * @member {string} state.accountLinkText -     The link text for the account icon
 * @member {object} state.message -             Message for the flash message box:
 * @member {string} state.message.text -        Text for the flash message box
 * @member {string} state.message.type -        Type of message = displayed
 *                                              green/red/hidden
 */
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
            hideComments: false,
            codeOutput: "",
            currentComments: [],
            accountLinkText: "Login/register",
            message: {
                text: "",
                type: "hidden"
            }
        };

    }

    /**
     * Handle result of server request for all documents the logged in user
     * is allowed to edit.
     *
     * @param {object}  data                       Data from server request response:
     * @param {object}  data.data.allowedDocs      Array of all filenames (strings) that
     *                                             the logged in user is allowed to edit
     */
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

    /**
     * Handle result of reading a document = result of GraphQL request
     *
     * @param {object}  data                       Data from server request response:
     * @param {object}  data.data.doc              Document properties:
     * @param {string} data.data.doc.filename      Filename
     * @param {boolean} data.data.doc.code         True = code mode, false text mode
     * @param {string} data.data.doc.title         Title
     * @param {string} data.data.doc.content       Content
     * @param {array} data.data.doc.comments       Array of comments (objects)
     * @param {array} data.data.doc.allowedusers   Array of allowed users (strings)
     * @param {string} data.data.doc.ownerName     Owner name
     * @param {string} data.data.doc.ownerEmail    Owner e-mail
     */
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
            currentComments: doc.comments,
            hideComments: false,
            message: {
                text: `Loaded document "${doc.filename}".`,
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

    /**
     * Handle text input change
     *
     * @param {object} ev         Event object where the change was recorded
     * @param {string} fieldName  Name of field where change was made
     */
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
        data.comments = this.state.currentComments;
        socket.emit("send", data);

        return;
    }

    /**
     * Handle click on filename dropdown option = save selected option to state
     *
     * @param {string} filename  Selected filename
     */
    handleFilesDropDownChange = (filename) => {
        this.setState({
            selectedFile: filename
        });
    }

    /**
     * Handle click on "SAVE" button = save or update selected file, or open login modal
     * if user is not logged in. Display error message if filename is already in use.
     */
    handleClickSave = () => {
        /** If user is not logged in, clicking save instead opens login window */
        if (this.state.token.length === 0) {
            this.loginModal("open");
            return;
        };

        const filenameIsValid = this.regexCheck("filename", this.state.currentFilename);
        /** If filename is blank, do not save */
        if (!filenameIsValid) {
            this.setFlashMessage({
                text: "Not saved. Filename can be alphanumeric only.",
                type: "error"
            });
            return;
        };

        /** If filename is blank, do not save */
        if (this.state.currentFilename.length === 0) {
            this.setFlashMessage({
                text: "Not saved. Filename cannot be blank.",
                type: "error"
            });
            return;
        };

        /** If _isSaved flag isn't set, the document gets created in the db */
        if (!this._isSaved) {
            backend(
                "create",
                ENDPOINT,
                this.afterCreateDoc, {
                    token: this.state.token,
                    filename: this.state.currentFilename,
                    code: this.state.codeMode,
                    title: this.state.currentTitle,
                    content: this.state.currentContent,
                    comments: this.state.currentComments,
                    email: this.state.currentUserEmail
                 }
            );
            return;
        }
        /** If _isSaved flag is set, the document gets updated in the db */
        if (this._isSaved) {
            backend(
                "update",
                ENDPOINT,
                this.afterUpdate, {
                    token: this.state.token,
                    filename: this.state.currentFilename,
                    title: this.state.currentTitle,
                    content: this.state.currentContent,
                    comments: this.state.currentComments
                 }
            );
            return;
        }

    }

    /**
     * Handle result of creating a document.
     *
     * @param {object} data  Data from server request response:
     * @param {boolean} data.tokenNotValid    User's token is valid = true
     * @param {boolean} data.acknowledged     Successful operation = true
     * @param {number}  data.modifiedCount    Number of modified records (always 1)
     * @param {null}    data.upsertedId       Id of upserted record (always null)
     * @param {number}  data.upsertedCount    Number of upserted records (always 0)
     * @param {number}  data.matchedCount     Number of matching records (always 1)
     */
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
                    text: "Document saved.",
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

    /**
     * Handle result of updating = saving changes to a document.
     *
     * @param {object} data  Data from server request response:
     * @param {boolean} data.tokenNotValid    User's token is valid = true
     * @param {boolean} data.notAllowed       User is not authorized = true
     * @param {boolean} data.acknowledged     Successful operation = true
     * @param {number}  data.modifiedCount    Number of modified records (always 1)
     * @param {null}    data.upsertedId       Id of upserted record (always null)
     * @param {number}  data.upsertedCount    Number of upserted records (always 0)
     * @param {number}  data.matchedCount     Number of matching records (always 1)
     */
    afterUpdate = (data) => {
        if (data.tokenNotValid) {
            this.setFlashMessage({
                text: "Token invalid. Session has expired/false token.",
                type: "error"
            });
            return;
        }

        if (data.notAllowed) {
            this.setFlashMessage({
                text: "Error: user not authorized to edit.",
                type: "error"
            });
            return;
        }

        this.setFlashMessage({
            text: "Changes saved.",
            type: "ok"
        });
        return;
    }

    /**
     * Handle click on "LOAD" button = load selected file, or open login modal
     * if user is not logged in.
     */
    handleClickLoad = () => {
        //If user is not logged in, clicking load instead opens login window
        if (this.state.token.length === 0) {
            this.loginModal("open");
            return;
        };

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

    /**
     * Handle click on "CLEAR" button = clear state connected to the current
     * document.
     */
    handleClickClear = () => {
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
    }

    /**
     * Either render or close the RegisterModal component
     *
     * @param {string} action  String representing the action to open or close
     */
    registerModal = (action) => {

        if (action === "open") {
            ReactDOM.render(
                <RegisterModal
                    registerModal={this.registerModal}
                    regexCheck={this.regexCheck}
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

    /**
     * Send a server request to register a new user
     *
     * @param {object} data             Object containing:
     * @param {string} data.email       The e-mail entered
     * @param {string} data.name        The name entered
     * @param {string} data.password    The password entered
     */
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

    /**
     * Set flash message to confirm that a user has been registered
     *
     * @param {object} data                 Data received from the request:
     * @param {boolean} data.acknowledged Successful request = true
     * @param {string}  data.insertedId   The objectid of the new user
     */
    afterRegisterUser = (data) => {
        this.setFlashMessage({
            text: "User succesfully registered. Ready to log in!",
            type: "ok"
        });
    }

    /**
     * Either render or close the LoginModal component
     *
     * @param {string} action  String representing the action to open or close
     */
    loginModal = (action) => {
        /** If something is stored in token, click means logout */
        if (this.state.token.length > 0) {
            this.clearStateAfterLogout();
            return;
        }

        if (action === "open") {
            ReactDOM.render(
                <LoginModal
                    loginModal={this.loginModal}
                    regexCheck={this.regexCheck}
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

    /**
     * Either render (and make a server request) or close the ShareModal component
     *
     * @param {string} action  String representing the action to open or close
     */
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

    /**
     * Call ReactDOM.render to render the ShareModal component
     *
     * @param {object} data              Data received from a server request:
     * @param {array} data.data.users    Array of all users' e-mail addresses
     */
    openShareModal = (data) => {
        let allUsers = data.data.users;

        ReactDOM.render(
            <ShareModal
                allUsers={allUsers}
                allowedUsers={this.state.currentAllowedUsers}
                currentUserEmail={this.state.currentUserEmail}
                regexCheck={this.regexCheck}
                shareModal={() => this.shareModal("close")}
                sendInvite={this.sendInvite}
                updateUsers={this.updateUsers}/>,
            document.getElementById('manage-allowed-users')
        )
    }

    /**
     * Send a server request to set the array of allowed users to data
     *
     * @param {array} data  New array of e-mail addresses of allowed users
     */
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

    /**
     * Handle result of updating array of allowed users in the database, save
     * the updated array to state
     *
     * @param {object} data                   Data received from server request:
     * @param {boolean} data.tokenNotValid    User's token is valid = true
     * @param {boolean} data.notAllowed       User is not authorized = true
     * @param {boolean} data.allowedusers     Updated array of allowed users
     */
    afterUpdateUsers = (data) => {
        if (data.tokenNotValid) {
            this.setFlashMessage({
                text: "Token invalid. Session has expired/false token.",
                type: "error"
            });
            return;
        }

        if (data.notAllowed) {
            this.setFlashMessage({
                text: "Error: user not authorized to edit.",
                type: "error"
            });
            return;
        }

        this.setState({
            currentAllowedUsers: data.allowedusers,
            message: {
                text: "Editing rights have been updated.",
                type: "ok"
            }
        });
    }

    /**
     * Set most of the state to its original values after logging out
     */
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

    /**
     * Receive input from login attempt and send to server for verification
     *
     * @param {string} email    Entered e-mail address
     * @param {string} password Entered password
     */
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

    /**
     * Handle result of login attempt. Set state to represent succesful or
     * unsuccesful login
     *
     * @param {object} data              Data received from server request:
     * @param {boolean} data.userexists  True/false if user exists/not
     * @param {boolean} data.verified    True/false if password correct/not
     * @param {string} data.token        JSON web token
     * @param {email} data.email         E-mail address of logged in user
     * @param {email} data.name          Name of logged in user
     */
    afterLoginAttempt = (data) => {
        if (data.userexists && data.verified) {
            /** Saves token in state if login is successful */
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

    /**
     * Toggle between code mode and normal text mode, clears most of the state
     */
    toggleCodeMode = () => {
        /** Set codeMode to opposite value of the current value */
        let codeMode = !this.state.codeMode;

        let msgText = "Switched to text mode.";

        if (codeMode) { msgText = "Switched to code mode."; }

        /** Clear all state except login details: user email, name and token */
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
            activateShareIcon: false,
            message: {
                text: msgText,
                type: "ok"
            }
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

    /**
     * Set currentComments to the received array
     *
     * @param {array} allComments Array of comments received from the
     * CommentBox component
     */
    addCommentToDropDown = (allComments) => {
        this.setState({
            currentComments: allComments
        });
        return;
    }

    /**
     * Toggle hide/show comments
     */
    toggleShowComments = () => {
        this.setState({
            hideComments: !this.state.hideComments
        }, () => {
            this.cleanUpComments(this.toggleCommentsCallback);
        });
    }

    /**
     * Remove any comments not found in document from comments array, save
     * to state
     *
     * @param {function} callback  Callback function, after state has been set
     */
    cleanUpComments = (callback) => {
        /** Make callback param optional */
        callback = callback || function(){};

        let comments = this.state.currentComments;

        let commentsNew = [];
        let commentNode;

        comments.forEach((comment, i) => {
            commentNode = this._editor.dom.get(`comment${comment.nr}`);
            if (commentNode) { commentsNew.push(comment); }
        });

        this.setState({
            currentComments: commentsNew
        }, () => { callback(); });
    }

    /**
     * Toggle hide/show for all comment img tags in the document
     */
    toggleCommentsCallback = () => {
        let comments = this.state.currentComments;
        let commentNode;

        comments.forEach((comment, i) => {
            commentNode = this._editor.dom.get(`comment${comment.nr}`);
            commentNode.hidden = this.state.hideComments;
        });
    }

    /**
     * Send invite and update allowedUsers array for the current document
     *
     * @param   {string} recipient  E-mail address of recipient
     */
    sendInvite = (recipient) => {
        let params = {
            token: this.state.token,
            recipient: recipient,
            inviterName: this.state.currentUserName,
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

    /**
     * Set message for the flash message box
     *
     * @param   {object} data                 Result:
     * @param   {boolean} data.inviteSent     True/false if successful/unsuccesful
     * @param   {boolean} data.tokenNotValid  True/false if successful/unsuccesful
     * @param   {boolean} data.notAllowed     True/false if successful/unsuccesful
     */
    afterInvite = (data) => {
        if (data.tokenNotValid) {
            this.setFlashMessage({
                text: "Token invalid. Session has expired/false token.",
                type: "error"
            });
            return;
        }

        if (data.notAllowed) {
            this.setFlashMessage({
                text: "Error: user not authorized to invite.",
                type: "error"
            });
            return;
        }

        this.setFlashMessage({
            text: "Invite sent.",
            type: "ok"
        });
    }

    /**
     * Send currentContent to the code API for parsing, after conversion to base64
     */
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

    /**
     * Set state for code output after receving the output from the code API
     *
     * @param   {object} data               Result:
     * @param   {object} data.data          Output as base64 coded string
     */
    afterExecuteCode = (data) => {
        let result = atob(data.data);
        this.setState({
            codeOutput: result,
            message: {
                text: "Code executed.",
                type: "ok"
            }
        });
    }

    /**
     * Send current document title and content to pdfPrint function.
     */
    handlePdfPrint = () => {
        pdfPrint(
            this.state.currentTitle,
            this.state.currentContent,
            ENDPOINT
        );
    }

    /**
     * Check if stringToValidate passes the regex check
     *
     * @param   {string} type               Type of regex check
     * @param   {string} stringToValidate   String to validate
     * @return  {boolean} isValid           True or false for valid/invalid
     */
    regexCheck = (type, stringToValidate) => {
        let expressions = {};

        expressions.filename = /^[a-zA-Z0-9_]*$/;
        expressions.email = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        const check = new RegExp(expressions[type]);
        const isValid = check.test(stringToValidate);

        return isValid;
    }

    /**
     * Emit new room name = the filename being switched to, over web socket
     *
     * @param   {string} newRoom New filename
     */
    switchRoom = (newRoom) => {
        socket.emit("leave", this.state.currentFilename);
        socket.emit("join", newRoom);
    }

    /**
     * Set state for the flash message box
     *
     * @param   {object} message            Message:
     * @param   {string} message.text       Message text
     * @param   {object} message.type       Message type
     */
    setFlashMessage = (message={ text: "", type: "hidden" }) => {
        this.setState({ message: message });
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
                            'insertdatetime media table paste wordcount'],
                        toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | help',
                        setup: (editor) => { this._editor = editor; }
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
                            onClick={() => this.shareModal("open")}/>
                        <HeaderIcon
                            elementId="accounticon"
                            icon="account_circle"
                            active={true}
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
                        onClick={this.handleClickClear} />
                    <div className="flex-row align-items-end">
                        <>
                        <FilesDropDown
                            elementId="fileDropdown"
                            codeMode={this.state.codeMode}
                            availableFiles={this.state.allowedDocs}
                            onChange={this.handleFilesDropDownChange}/>
                        <Button
                            classes=""
                            elementId="buttonLoad"
                            label="OPEN"
                            onClick={this.handleClickLoad} />
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
                            onClick={() => this.cleanUpComments(this.handleClickSave)} />
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
                        editor={this._editor}
                        content={this.state.currentContent}
                        comments={this.state.currentComments}
                        commentsAreHidden={this.state.hideComments}
                        toggleShowComments={this.toggleShowComments}
                        addCommentToDropDown={this.addCommentToDropDown}
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
                        currentContent: data.content,
                        currentComments: data.comments
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
