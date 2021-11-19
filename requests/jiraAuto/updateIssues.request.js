const request = require('request');


async function updateIssue(issueKey, bodyUpdateRequest) {
    const reqObj = {
        method: 'PUT',
        url: `${global.jira.host}/rest/api/latest/issue/${issueKey}/`,
        strictSSL: false,
        auth: {
            username: global.auth.USERNAME,
            password: global.auth.PASSWORD
        },
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(
            bodyUpdateRequest
        )
    };

    return new Promise((resolve, reject) => {
        request(
            reqObj,
            function (error, request, body) {
                if (error) throw new Error(error);
                /* todo: сделать валидацию ответа во всех реквестах */
                resolve(JSON.parse(body));
            }
        );
    });
}


async function updateIssues(issueUpdateMap) {
    for (let key in issueUpdateMap) {
        if (issueUpdateMap[key].fields && Object.keys(issueUpdateMap[key].fields).length > 0)
            await updateIssue(key, issueUpdateMap[key]);
    }
}

exports.updateIssues = updateIssues;