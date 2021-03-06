const request = require('request');

/*создание пр*/
function closeTask(taskId, comment = '', callback=()=>{}) {
    const data = {
        method: 'POST',
        url: `${global.jira.host}/rest/api/2/issue/${taskId}/transitions`,
        strictSSL: false,
        auth: {
            username: global.auth.USERNAME,
            password: global.auth.PASSWORD
        },
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: `{"transition": {"id": "${global.jira.subtask.transitions.done.id}"}, "update": {

        "comment": [
            {
                "add": {
                    "body": "${comment}"
                }
            }
        ]
    }}`
    };

    request(data, function (error, response, body) {
        if (error) throw new Error(error);
        /* todo: сделать валидацию ответа во всех реквестах */
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
exports.closeTask = closeTask;
