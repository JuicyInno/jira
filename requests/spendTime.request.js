
const request = require('request');
/*создание пр*/

function spendTime(task, comment = '', time = '0',callback=()=>{}) {
    const data = {
        method: 'POST',
        url: `${global.jira.host}/rest/api/2/issue/${task}/worklog`,
        strictSSL: false,
        auth: {
            username: global.auth.USERNAME,
            password: global.auth.PASSWORD
        },
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: `{
        "timeSpentSeconds": ${+time.slice(0, 2) * 3600 + (+time.slice(2, 4) * 60)},
        "comment": "${comment}"
    }`
    };
    request(data, function (error) {
        if (error) throw new Error(error);
        /* todo: сделать валидацию ответа во всех реквестах */
        callback();
    });
}

//--------------------------
exports.spendTime = spendTime;
