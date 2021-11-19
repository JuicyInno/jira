const request = require('request');

const MAX_RESULTS = 20;

/* получение задач и подзадач постранично */
async function getSprintsPage(
    boardId = global.jira.boardId,
    startAt = 0,
    maxResults = MAX_RESULTS
) {
    const reqObj = {
        method: 'GET',
        url: `${global.jira.host}/rest/agile/1.0/board/${boardId}/sprint`+
            `?startAt=${startAt}&maxResults=${maxResults}`,
        strictSSL: false,
        auth: {
            username: global.auth.USERNAME,
            password: global.auth.PASSWORD
        },
        headers: {
            'Accept': 'application/json'
        }
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
async function getAllSprints(boardId = global.jira.boardId) {
    // console.log("Получаем данные из Jira");
    let startAt, maxResult = 50;
    let sprintsArr = [];
    for (startAt = 0; ; startAt += maxResult) {
        let sprintsPage = await getSprintsPage(boardId, startAt, maxResult);
        sprintsArr = sprintsArr.concat(sprintsPage.values);
        if (sprintsPage.total < startAt + maxResult || sprintsPage.isLast) {
            break;
        }
    }
    return sprintsArr;
}
//--------------------------

exports.getAllSprints = getAllSprints;
