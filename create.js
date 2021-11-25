const {login} = require('./main/login');
const {selectTask} = require('./main/selectTask');
const {getTasks} = require('./main/getAllStory');
const {storyAction} = require('./main/storyAction');
const {requestClosetask} = require('./main/closeTask');
const {reportMenuMain, reportMenuResultOptions} = require('./main/reportMenu');
const {sprintMenuMain} = require('./main/sprintUpdateMenu');

const {getStory} = require('./requests/getStory.request');
const {closeTask} = require('./requests/closeTask.request');
const {assigneeTaskTo} = require('./requests/assigneeTask.request');
const {toWork} = require('./requests/toWork.request');
const {createPr} = require('./requests/pr.request');
const {spendTime} = require("./requests/spendTime.request");
const {setIssueLabels} = require('./requests/setIssueLabels.request');
const {getAllIssues} = require('./requests/report/getAllIssues.request');
const {getAllSprints} = require('./requests/jiraAuto/getAllSprints.request');
const {updateIssues} = require('./requests/jiraAuto/updateIssues.request');
const {updateIssuesPoints} = require('./requests/jiraAuto/updateIssuesPoints.request');
const {updateRemainingEstimates} = require('./requests/jiraAuto/updateRemainingEstimates.request');

const {currentBrunch, currentRepoLink} = require('./utils/helpers');
const {
    calcIssueSummary,
    calcIssueDueDate,
    calcRemainingEstimate,
    getIssuesWithPointDiff
} = require('./utils/jiraAuto/issues');
const {getSprintEndDate, searchTargetSprint} = require('./utils/jiraAuto/sprints');


exports.methods = {
    login,
    selectTask,
    getTasks,
    storyAction,
    getStory,
    requestClosetask,
    reportMenuMain,
    reportMenuResultOptions,
    sprintMenuMain
};

exports.requests = {
    closeTask,
    createPr,
    assigneeTaskTo,
    spendTime,
    toWork,
    setIssueLabels,
    getAllIssues,
    getAllSprints,
    updateIssues,
    updateIssuesPoints,
    updateRemainingEstimates
};

exports.utils = {
    currentBrunch,
    currentRepoLink,
    calcIssueSummary,
    calcIssueDueDate,
    calcRemainingEstimate,
    getIssuesWithPointDiff,
    getSprintEndDate,
    searchTargetSprint
};
console.clear();

/* настройки для Jira */
global.jira = {};
global.jira.host = "https://task.corp.dev.vtb"; /* хост апи */
global.jira.project = "SERV"; /* наименование проекта для JQL запросов */
global.jira.subtask = {}; /* для хранения констант связанных с подзадачами (!) */
global.jira.subtask.transitions = {}; /* возможные статусы подзадач */
global.jira.subtask.transitions.to_work = {
    "id": "101",
    "name": "В работу"
};
global.jira.subtask.transitions.done = {
    "id": "71",
    "name": "Выполнить"
};
global.jira.subtask.transitions.decline = {
    "id": "41",
    "name": "Отклонить"
};
global.jira.boardId = 1415;
global.jira.teamMembersCount = 11;
global.jira.sprintDaysCount = 9;
global.jira.TASK_TYPE_ID = "10000";
global.jira.TASK_TYPE_NAME = "Задача";

/* настройки для Bitbucket */
global.bitbucket = {};
global.bitbucket.host = "https://bitbucket.region.vtb.ru"; /* хост апи */
global.bitbucket.mainBranchName = "master"; /* имя ветки в которую делаются пулл реквесты (pull requests) */

global.config = {};
global.config.adminMode = (process.argv.indexOf("--admin") > 0);

//  1) логинимся
login(() => selectTask());


