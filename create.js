const {login} = require('./main/login');
const {selectTask} = require('./main/selectTask');
const {getTasks} = require('./main/getAllStory');
const {storyAction} = require('./main/storyAction');
const {requestClosetask} = require('./main/closeTask');

const {getStory} = require('./requests/getStory.request');
const {closeTask} = require('./requests/closeTask.request');
const {assigneeTaskTo} = require('./requests/assigneeTask.request');
const {createPr} = require('./requests/pr.request');
const {currentBrunch, currentRepoLink} = require('./utils/helpers');


const {spendTime} = require("./requests/spendTime.request");


exports.methods = {
    login,
    selectTask,
    getTasks,
    storyAction,
    getStory,
    requestClosetask
};
exports.requests = {
    closeTask,
    createPr,
    assigneeTaskTo,
    spendTime
};

exports.utils = {
    currentBrunch,
    currentRepoLink
};
console.clear();

/* настройки для Jira */
global.jira = {};
global.jira.host = "https://task.corp.dev.vtb"; /* хост апи */
global.jira.project = "SERV"; /* наименование проекта для JQL запросов */
global.jira.subtask = {}; /* для хранения констант связанных с подзадачами (!) */
global.jira.subtask.transitions = {}; /* возможные статусы подзадач */
global.jira.subtask.transitions.to_work = {
    "id": "11",
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

/* настройки для Bitbucket */
global.bitbucket = {};
global.bitbucket.host = "https://bitbucket.region.vtb.ru"; /* хост апи */
global.bitbucket.mainBranchName = "master"; /* имя ветки в которую делаются пулл реквесты (pull requests) */


//  1) логинимся
login(() => selectTask());


