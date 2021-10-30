![Github Actions](https://github.com/xlsson/bth-reactjs-editor/actions/workflows/node.js.yml/badge.svg)

![CirrusDocs](https://github.com/xlsson/bth-reactjs-editor/blob/main/src/img/logo.png?raw=true)

# bth-reactjs-editor
Frontend for the the CirrusDocs app. CirrusDocs is a single-page real-time collaborative document editor app, written in JavaScript utilising the React library. The app was created as a student project for the course JavaScript-based Web Frameworks at Blekinge Institute of Technology (BTH).

The backend of the editor is served by an Express server written in Node.js:
([xlsson/bth-editor-server](https://github.com/xlsson/bth-editor-server)).

![CirrusDocs](https://github.com/xlsson/bth-reactjs-editor/blob/main/src/img/screenshot.png?raw=true)

### Features

At the heart of the app, CirrusDocs implements ([TinyMCE](https://www.npmjs.com/package/@tinymce/tinymce-react)) to create rich-text documents.

Real-time collaboration is possible thanks to web sockets (through the ([socket.io-client](https://www.npmjs.com/package/socket.io-client)) package). Two or more users who have opened the same document can edit it simultaneously.

Register and log in to access the save and load features. Documents are saved in the cloud (a MongoDB database).

Documents can be shared with other registered users, or by sending an invite e-mail to a not yet registered user (for this, the backend uses ([SendGrid](https://www.npmjs.com/package/@sendgrid/mail))).

Switch between text mode and code mode. Code mode uses ([CodeMirror](https://www.npmjs.com/package/react-codemirror2)), and allows writing JavaScript code, which can be executed (through an API connection to ([execjs](https://execjs.emilfolino.se/documentation.html))). Code documents can be saved and loaded parallel to normal text documents.

Documents can be converted to a PDF file for printing. The backend utilises ([html-pdf-node](https://www.npmjs.com/package/html-pdf-node)) for PDF conversion.

Comments can be inserted and deleted in the documents. The comments can be hidden or shown. The technology behind this is a TinyMCE command to insert a node, and the ([text-to-image](https://www.npmjs.com/package/text-to-image)) package, which creates a data URI image with the current comment number.

### Installation instructions
1. Follow the installation instructions for https://github.com/xlsson/bth-editor-server to install the necessary server and create the MongoDB database.

2. Run `git clone https://github.com/xlsson/bth-reactjs-editor` to clone this repository.

3. Run `npm install` to install the dependencies listed in `package.json`.

4. Create a `./temppf` folder, for temporary PDF file storage.

5. Create the JSON-files `.db/config.json` and `.db/testconfig.json`. `.db/config.json` should include the properties `username`, `password`, and `dbname` for your database, a random `jwtsecret` string used to create JSON web tokens, and two properties for SendGrid (for the e-mail sharing service): `sendgridsender` (e-mail address) and `sendgridsecret`. To get the last two properties, create a SendGrid account.


### Tests
