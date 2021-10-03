function backend(request, baseUrl, callback, params = {}) {
    let url;

    if (request === "readall") {
        url = `${baseUrl}/readall/${params.email}`;
        const requestOptions = {
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': params.token
            }
        };
        sendRequest(url, callback, requestOptions);
        return;
    }

    if (request === "readone") {
        url = `${baseUrl}/readone/${params.filename}`;
        const requestOptions = {
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': params.token
            }
        };
        sendRequest(url, callback, requestOptions);
        return;
    }

    if (request === "create") {
        url = `${baseUrl}/createone`;
        const requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': params.token
            },
            body: JSON.stringify({
                filename: params.filename,
                title: params.title,
                content: params.content,
                email: params.email
             })
        };
        sendRequest(url, callback, requestOptions);
        return;
    }

    if (request === "update") {
        url = `${baseUrl}/updateone`;
        const requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': params.token
            },
            body: JSON.stringify({
                filename: params.filename,
                title: params.title,
                content: params.content
             })
        };
        sendRequest(url, callback, requestOptions);
        return;
    }

    if (request === "verifylogin") {
        url = `${baseUrl}/verifylogin`;
        const requestOptions = {
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
        const requestOptions = {
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
