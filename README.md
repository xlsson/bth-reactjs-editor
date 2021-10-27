![Github Actions](https://github.com/xlsson/bth-reactjs-editor/actions/workflows/node.js.yml/badge.svg)

## CirrusDocs
CirrusDocs is a single-page real-time collaborative document editor app, written in JavaScript utilising the React library. The app was created as a student project for the course JavaScript-based Web Frameworks at Blekinge Institute of Technology (BTH).

The backend of the editor is served by an Express server written in Node.js:
([xlsson/bth-editor-server](https://github.com/xlsson/bth-editor-server)).

### Features

At the heart of the app, CirrusDocs implements ([TinyMCE](https://www.npmjs.com/package/@tinymce/tinymce-react)) to create rich-text documents.

Real-time collaboration is possible thanks to web sockets (through the ([socket.io-client](https://www.npmjs.com/package/socket.io-client)) package). Two or more users who have opened the same document can edit it simultaneously.

Register and log in to access the save and load features. Documents are saved in the cloud (a MongoDB database).

Documents can be shared with other registered users, or by sending an invite e-mail to a not yet registered user (for this, the backend uses ([SendGrid](https://www.npmjs.com/package/@sendgrid/mail))).

Switch between text mode and code mode. Code mode uses ([CodeMirror](https://www.npmjs.com/package/react-codemirror2)), and allows writing JavaScript code, which can be executed (through an API connection to ([execjs](https://execjs.emilfolino.se/documentation.html))). Code documents can be saved and loaded parallel to normal text documents.

Documents can be converted to a PDF file for printing. The backend utilises ([html-pdf-node](https://www.npmjs.com/package/html-pdf-node)) for PDF conversion.

Comments can be inserted and deleted in the documents. The comments can be hidden or shown. The technology behind this is a TinyMCE command to insert a node, and the ([text-to-image](https://www.npmjs.com/package/text-to-image)) package, which creates a data URI image with the current comment number.

### Screenshots

### Installation

### Tests
