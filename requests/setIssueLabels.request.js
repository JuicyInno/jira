const request = require('request');

/* записать метки в задачу */
function setIssueLabels(taskId, labels = [""], callback=()=>{}) {
    const data = {
        method: 'PUT',
        url: `${global.jira.host}/rest/api/2/issue/${taskId}`,
        strictSSL: false,
        auth: {
            username: global.auth.USERNAME,
            password: global.auth.PASSWORD
        },
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "fields": {
                "labels": labels
            }
        })
    };

    request(data, function (error, response, body) {
        if (error) throw new Error(error);
        /* проверка статуса на 2хх */
        if(response && Math.floor(response.statusCode / 100) !== 2) {
            let msg = `!!! request to: ${data.url} response status code: ${response.statusCode}` +
                `${body ? ` with body: ${JSON.stringify(body)}` : ""} !!!`
            console.error(msg);
            throw new Error(msg);
        }
        callback()
    });
}
//--------------------------
exports.setIssueLabels = setIssueLabels;
