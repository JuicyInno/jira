const request = require('request');


function toWork(taskId, comment = '', callback=()=>{}) {
    const data = {
        method: 'POST',
        url: `${global.jira.host}/rest/api/2/issue/${taskId}/transitions `,
        strictSSL: false,
        auth: {
            username: global.auth.USERNAME,
            password: global.auth.PASSWORD
        },
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: ` {"transition": {"id": "${jira.subtask.transitions.to_work.id}"}}`
    };
    request(data, function (error) {

        if (error) throw new Error(error);
        callback()
    });
}
//--------------------------
exports.toWork = toWork;
