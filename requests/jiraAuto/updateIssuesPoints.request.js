const request = require('request');


async function updateOneIssuePoints(issueKey, points) {
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
            {
                "fields": {
                    "customfield_10200": points
                }
            }
        )
    };

    console.log("Обновляем: " + issueKey);
    return new Promise((resolve, reject) => {
        request(
            reqObj,
            function (error, request, body) {
                if (error) throw new Error(error);
                /* todo: сделать валидацию ответа во всех реквестах */
                if(request.statusCode === 204){
                    resolve();
                } else {
                    reject("unexpected response status, expect: 204, got: " + request.statusCode);
                }
            }
        );
    });
}


async function updateIssuesPoints(issuesWithDiff) {
    for (let key in issuesWithDiff) {
        await updateOneIssuePoints(key, issuesWithDiff[key].calc);
    }
}

exports.updateIssuesPoints = updateIssuesPoints;