const inquirer = require('inquirer');
const lib = require('./../create');
const {log} = require('./../utils/log');

//--------------------------
const menuData = [
    'Обновить суммы сторипоинтов для задач',
    'Обновить названия для задач и время завершения',
    'Обновить трудозатраты для задач (!!! каждый раз будет вычисляться новое значение !!!)',
    '<----- Назад'
];

/* текущий или грядущий спринт */
let targetSprint;
/* все задачи (сущности) спринта */
let issueMap;
/* только задачи спринта */
let taskMap;

function sprintMenuMain() {
    if (global.config.adminMode) {
        inquirer.prompt(
            [
                {
                    type: 'list',
                    message: 'Выберете действие:',
                    name: 'id',
                    choices: [].concat(menuData)
                }
            ]
        ).then(
            async (answers) => {
                switch (answers.id) {
                    case menuData[0]: /* 'Обновить суммы сторипоинтов для задач' */
                        await preset();
                        lib.utils.getIssuesWithPointDiff(taskMap);
                        await lib.requests.updateIssuesPoints(
                            lib.utils.getIssuesWithPointDiff(taskMap)
                        );
                        lib.methods.sprintMenuMain();
                        break;
                    case menuData[1]: /* 'Обновить названия для задач и время завершения' */
                        await preset();
                        let issueUpdateMap = {};
                        lib.utils.calcIssueDueDate(taskMap, issueUpdateMap, targetSprint);
                        lib.utils.calcIssueSummary(taskMap, issueUpdateMap, targetSprint);
                        await lib.requests.updateIssues(issueUpdateMap);
                        lib.methods.sprintMenuMain();
                        break;
                    case menuData[2]: /* 'Обновить трудозатраты для задач (!!! каждый раз будет вычисляться новое значение !!!)' */
                        // lib.methods.getTasks();
                        await preset();
                        lib.utils.calcRemainingEstimate(taskMap, global.jira.teamMembersCount);
                        await lib.requests.updateRemainingEstimates(taskMap);
                        lib.methods.sprintMenuMain();
                        break;

                    default: /* 'ВЫЙТИ' */
                        lib.methods.selectTask();
                        break;
                }
            }
        );
    } else {
        console.log("у вас недостаточно прав!")
        lib.methods.selectTask();
    }
}

async function preset() {
    console.log("Инициализируем данные для обновления;")
    let sprintsArr = await lib.requests.getAllSprints(global.jira.boardId);

    targetSprint = lib.utils.searchTargetSprint(sprintsArr);
    issueMap = {};
    if (targetSprint) {
        let targetSprintId = targetSprint.id;
        issueMap = await lib.requests.getAllIssues(targetSprintId);
    } else {
        throw "no sprint found";
    }

    taskMap = {};
    for (let key in issueMap) {
        if (issueMap[key].selfData.fields.issuetype.id === global.jira.TASK_TYPE_ID
            && issueMap[key].selfData.fields.issuetype.name === global.jira.TASK_TYPE_NAME) {
            taskMap[key] = issueMap[key];
        }
    }
}


//--------------------------

exports.sprintMenuMain = sprintMenuMain;
