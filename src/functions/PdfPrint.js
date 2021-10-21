function pdfPrint(title, content, baseUrl) {
    let html, header, body, footer;

    header = `<div style="margin:100px;">`;
    body = `<h1>${title}</h1>`;
    body += content;
    footer = "</div>";

    html = header + body + footer;

    console.log(html);

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
