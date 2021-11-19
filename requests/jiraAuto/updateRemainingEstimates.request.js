const request = require('request');


/** update estimate in hours (8h = 1d) */
async function updateRemainingEstimate(issueKey, remainingEstimateHours) {
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
                    "timetracking": {
                        "remainingEstimate": `${remainingEstimateHours}h`
                    }
                }
            }
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


async function updateRemainingEstimates(issueMap) {
    for (let key in issueMap) {
        await updateRemainingEstimate(key, issueMap[key].selfData.fields.timetracking.remainingEstimateHours);
    }
}

exports.updateRemainingEstimates = updateRemainingEstimates;