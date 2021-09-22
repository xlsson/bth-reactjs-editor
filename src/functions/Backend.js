function backend(request, baseUrl, callback, params = {}) {
    let url;

    if (request === "readall") {
        url = `${baseUrl}/readall`;
        getRequest(url, callback);
        return;
    }

    if (request === "readone") {
        url = `${baseUrl}/readone/${params.id}`;
        getRequest(url, callback);
        return;
    }

    if (request === "create") {
        url = `${baseUrl}/createone`;
        postRequest(url, callback, params);
        return;
    }

    if (request === "update") {
        url = `${baseUrl}/updateone`;
        putRequest(url, callback, params);
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

function postRequest(url, callback, params) {
    const requestOptions = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            filename: params.filename,
            title: params.title,
            content: params.content
         })
    };

    fetch(url, requestOptions)
        .then(response => response.json())
        .then(function(data) {
            return callback(data);
        });
}
function putRequest(url, callback, params) {
    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            docid: params.docid,
            title: params.title,
            content: params.content
         })
    };
    fetch(url, requestOptions)
        .then(function(data) {
            return callback(data);
        });
}

export default backend;
