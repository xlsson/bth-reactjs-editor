function backend(request, baseUrl, callback, params = {}) {
    let url;

    if (request === "readall") {
        url = `${baseUrl}/readall/${params.email}`;
        getRequest(url, callback);
        return;
    }

    if (request === "readone") {
        url = `${baseUrl}/readone/${params.filename}`;
        getRequest(url, callback);
        return;
    }

    if (request === "create") {
        url = `${baseUrl}/createone`;
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filename: params.filename,
                title: params.title,
                content: params.content,
                email: params.email
             })
        };
        putRequest(url, callback, requestOptions);
        return;
    }

    if (request === "update") {
        url = `${baseUrl}/updateone`;
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filename: params.filename,
                title: params.title,
                content: params.content
             })
        };
        putRequest(url, callback, requestOptions);
        return;
    }

    if (request === "createuser") {
        url = `${baseUrl}/createuser`;
        const requestOptions = {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: params.name,
                email: params.email
             })
        };
        postRequest(url, callback, requestOptions);
        return;
    }

    console.log("no http request made");
    return;
}

function getRequest(url, callback) {
    fetch(url)
    .then(response => response.json())
    .then(function(data) {
        return callback(data);
    });
}

function postRequest(url, callback, requestOptions) {
    fetch(url, requestOptions)
        .then(response => response.json())
        .then(function(data) {
            return callback(data);
        });
}

function putRequest(url, callback, requestOptions) {
    fetch(url, requestOptions)
        .then(response => response.json())
        .then(function(data) {
            return callback(data);
        });
}

export default backend;
