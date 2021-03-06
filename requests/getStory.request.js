const request = require('request');

/* получение сторей по реквесту*/
function getStory(filter = 'All', callback = () => {
}) {
    const data = {
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
        body: `{
              "jql": "${global.REQ}",
              "maxResults": 100,
              "fields": [
                "key",
                "issuetype",
                "description",
                "summary",
                "created",
                "assignee",
                "customfield_10100",
                "status",
                "labels"
              ],
              "startAt": 0
            }`
    };
    request(data, function (error, request, body) {
            if (error) throw new Error(error);
            /* todo: сделать валидацию ответа во всех реквестах */
            callback(JSON.parse(body).issues.filter(i => {
                let result = !!(i.fields.issuetype.subtask);
                result && filter !== 'All' && (result = ~i.fields.summary.indexOf(filter));
                return result;
            }));
        }
    );
}

//--------------------------
exports.getStory = getStory;
