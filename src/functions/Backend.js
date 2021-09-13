function backend(request, callback, id = '') {
    const baseUrl = 'https://jsramverk-editor-riax20.azurewebsites.net'

    if (request === "readall") {
        let url = `${baseUrl}/readall`;
        fetch(url)
        .then(response => response.json())
        .then(function(data) {
            callback(data);
            return;
        });
    }

    if (request === "open") {
        let url = `${baseUrl}/readone/${id}`;
        fetch(url)
        .then(response => response.json())
        .then(function(data) {
            callback(data);
            return;
        });
    }

}

export default backend;
