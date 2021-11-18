const request = require('request');

const MAX_RESULTS = 20;

/* получение задач и подзадач постранично */
async function getIssuesPage(
    startAt = 0,
    maxResults = MAX_RESULTS
) {
    const reqObj = {
        method: 'POST',
        url: `${global.jira.host}/rest/api/2/search`,
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
                "jql": global.REQ,
                "startAt": startAt,
                "maxResults": maxResults,
                "fields": [
                    "issuetype",
                    "customfield_10200",
                    "status",
                    "summary",
                    "parent",
                    "timetracking"
                ]
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

/* получение задач и подзадач целиком (постраничные запросы)  */
async function getAllIssues() {
    console.log("Получаем данные из Jira");
    let startAt;
    let maxResults = MAX_RESULTS;
    let issuesArr = [];

    for (startAt = 0; ; startAt += maxResults) {
        let issuesPage = await getIssuesPage(startAt, maxResults);
        issuesArr = issuesArr.concat(issuesPage.issues);
        if (issuesPage.total < startAt + maxResults || issuesPage.isLast) {
            startAt = issuesPage.total;
            break;
        }
    }

    let issueTaskMap = {};

    issuesArr
        .filter(issue => issue.fields.issuetype.subtask === false)
        .forEach(issue => issueTaskMap[issue.key] = {
            "selfData": issue
        });
    issuesArr
        .filter(subtask => subtask.fields.issuetype.subtask === true)
        .forEach(subtask => {
            if (!issueTaskMap[subtask.fields.parent.key].subtasks) {
                issueTaskMap[subtask.fields.parent.key].subtasks = [];
            }
            issueTaskMap[subtask.fields.parent.key].subtasks.push(subtask)
        });

    return issueTaskMap;
}

//--------------------------
exports.getAllIssues = getAllIssues;
