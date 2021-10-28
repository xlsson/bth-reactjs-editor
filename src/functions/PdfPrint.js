/**
 * Create a HTML string using title and content, and send server request to
 * create a PDF file to print document.
 *
 * @param   {string} title       Document title
 * @param   {string} content     Document contents
 * @param   {string} baseUrl     Base URL to server
 */
function pdfPrint(title, content, baseUrl) {
    let html, header, body, footer;

    header = `<div style="margin:100px;">`;
    body = `<h1>${title}</h1>`;
    body += content;
    footer = "</div>";

    html = header + body + footer;

    fetch(`${baseUrl}/printpdf`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            html: html
        }),
    })
    .then(response => response.blob())
    .then(response => {
        const pdfBlob = new Blob([response], {
            type: "application/pdf"
        });
        var objectURL = URL.createObjectURL(pdfBlob);
        window.open(objectURL);
    })
    .catch(error => {
        console.log(error);
    });

    return;
}

export default pdfPrint;
