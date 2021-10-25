function backend(request, baseUrl, callback, params = {}) {
    let url = `${baseUrl}/graphql`;
    let requestOptions = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-access-token': params.token
        }
    };

    if (request === "alloweddocs") {
        let query = `{ allowedDocs (email: "${params.email}", code: ${params.code}) { filename } }`;
        requestOptions.body = JSON.stringify({ query: query });
        sendRequest(url, callback, requestOptions);
        return;
    }

    if (request === "readone") {
        let query = `{ doc (filename: "${params.filename}") { filename, title, content, allowedusers, ownerName, ownerEmail, comments { nr, text } } }`;
        requestOptions.body = JSON.stringify({ query: query });
        sendRequest(url, callback, requestOptions);
        return;
    }

    if (request === "allusers") {
        let query = `{ users { email } }`;
        requestOptions.body = JSON.stringify({ query: query });
        sendRequest(url, callback, requestOptions);
        return;
    }

    if (request === "create") {
        url = `${baseUrl}/createone`;
        requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': params.token
            },
            body: JSON.stringify({
                filename: params.filename,
                code: params.code,
                title: params.title,
                content: params.content,
                comments: params.comments,
                email: params.email
             })
        };
        sendRequest(url, callback, requestOptions);
        return;
    }

    if (request === "update") {
        url = `${baseUrl}/updateone`;
        requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': params.token
            },
            body: JSON.stringify({
                filename: params.filename,
                title: params.title,
                content: params.content,
                comments: params.comments
             })
        };
        sendRequest(url, callback, requestOptions);
        return;
    }

    if (request === "updateusers") {
        url = `${baseUrl}/updateusers`;
        requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': params.token
            },
            body: JSON.stringify({
                filename: params.filename,
                allowedusers: params.allowedusers
             })
        };
        sendRequest(url, callback, requestOptions);
        return;
    }

    if (request === "verifylogin") {
        url = `${baseUrl}/verifylogin`;
        requestOptions = {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: params.email,
                password: params.password,
             })
        };
        sendRequest(url, callback, requestOptions);
        return;
    }

    if (request === "createuser") {
        url = `${baseUrl}/createuser`;
        requestOptions = {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: params.name,
                email: params.email,
                password: params.password
             })
        };
        sendRequest(url, callback, requestOptions);
        return;
    }

    if (request === "sendinvite") {
        url = `${baseUrl}/sendinvite`;
        requestOptions = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': params.token
            },
            body: JSON.stringify({
            recipient: params.recipient,
            inviterName: params.inviterName,
            inviterEmail: params.inviterEmail,
            filename: params.filename,
            title: params.title
             })
        };
        sendRequest(url, callback, requestOptions);
        return;
    }

    if (request === "execute") {
        url = `https://execjs.emilfolino.se/code`;
        requestOptions = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code: params.code
             })
        };
        sendRequest(url, callback, requestOptions);
        return;
    }

    console.log("no http request made");
    return;
}

function sendRequest(url, callback, requestOptions) {
    fetch(url, requestOptions)
        .then(response => response.json())
        .then(function(data) {
            return callback(data);
        });
}

export default backend;
