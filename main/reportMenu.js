const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const lib = require('./../create');
const {log} = require('./../utils/log');

const homedir = require('os').homedir();
const reportRootDir = path.join(homedir, "/Documents/JiraReports");
global.REQ = '';

const menuDataMain = [
    'Все (сторипоинты + подзадачи)',
    'Сторипоинты',
    'Подзадачи о командам',
    '<----- Назад',
];

const menuDataResultOptions = [
    'Отобразить в консоли',
    'Сохранить',
    'Показать и сохранить',
    '<----- Назад',
];

//--------------------------
function reportMenuMain() {
    inquirer
        .prompt(
            [
                {
                    type: 'list',
                    message: 'Выберите отчет: ',
                    name: 'id',
                    choices: [].concat(menuDataMain)
                }
            ]
        )
        .then(
            async (answer) => {
                let issueTaskMap;
                let resultOptions;
                switch (answer.id) {
                    case menuDataMain[0]: /* 'Все (сторипоинты + подзадачи)' */
                        global.REQ = `project=${global.jira.project} AND (Sprint  in (openSprints()) )`;
                        resultOptions = await reportMenuResultOptions(answer.id);
                        if (menuDataResultOptions.indexOf(resultOptions) === 3) {
                            return;
                        }
                        issueTaskMap = await lib.requests.getAllIssues();
                        switch (resultOptions) {
                            case menuDataResultOptions[0]:
                                printConsoleStatisticStoryPoints(getStatisticStoryPoints(issueTaskMap));
                                console.log("\n\n");
                                printConsoleStatisticCommand(getStatisticCommand(issueTaskMap));
                                break;
                            case menuDataResultOptions[1]:
                                csvStatisticStoryPoints(getStatisticStoryPoints(issueTaskMap));
                                csvStatisticCommand(getStatisticCommand(issueTaskMap));
                                break;
                            case menuDataResultOptions[2]:
                                printConsoleStatisticStoryPoints(getStatisticStoryPoints(issueTaskMap));
                                csvStatisticStoryPoints(getStatisticStoryPoints(issueTaskMap));
                                console.log("\n\n");
                                printConsoleStatisticCommand(getStatisticCommand(issueTaskMap));
                                csvStatisticCommand(getStatisticCommand(issueTaskMap));
                                break;
                        }
                        lib.methods.reportMenuMain();
                        break;
                    case menuDataMain[1]: /* 'Сторипоинты' */
                        global.REQ = `project=${global.jira.project} AND (Sprint  in (openSprints()) )`;
                        resultOptions = await reportMenuResultOptions(answer.id);
                        if (menuDataResultOptions.indexOf(resultOptions) === 3) {
                            return;
                        }
                        issueTaskMap = await lib.requests.getAllIssues();
                        switch (resultOptions) {
                            case menuDataResultOptions[0]:
                                printConsoleStatisticStoryPoints(getStatisticStoryPoints(issueTaskMap));
                                break;
                            case menuDataResultOptions[1]:
                                csvStatisticStoryPoints(getStatisticStoryPoints(issueTaskMap));
                                break;
                            case menuDataResultOptions[2]:
                                printConsoleStatisticStoryPoints(getStatisticStoryPoints(issueTaskMap));
                                csvStatisticStoryPoints(getStatisticStoryPoints(issueTaskMap));
                                break;
                        }
                        lib.methods.reportMenuMain();
                        break;
                    case menuDataMain[2]: /* 'Подзадачи по командам' */
                        global.REQ = `project=${global.jira.project} AND (Sprint  in (openSprints()) )`;
                        resultOptions = await reportMenuResultOptions(answer.id);
                        if (menuDataResultOptions.indexOf(resultOptions) === 3) {
                            return;
                        }
                        issueTaskMap = await lib.requests.getAllIssues();
                        switch (resultOptions) {
                            case menuDataResultOptions[0]:
                                printConsoleStatisticCommand(getStatisticCommand(issueTaskMap));
                                break;
                            case menuDataResultOptions[1]:
                                csvStatisticCommand(getStatisticCommand(issueTaskMap));
                                break;
                            case menuDataResultOptions[2]:
                                printConsoleStatisticCommand(getStatisticCommand(issueTaskMap));
                                csvStatisticCommand(getStatisticCommand(issueTaskMap));
                                break;
                        }
                        lib.methods.reportMenuMain();
                        break;
                    case menuDataMain[3]: /* '<----- Назад' */
                        console.clear();
                        lib.methods.selectTask();
                        break;
                }
            }
        );
}


function reportMenuResultOptions(
    selectedReport = ""
) {
    return inquirer
        .prompt(
            [
                {
                    type: 'list',
                    message: `${selectedReport ? `Тип отчета: ${selectedReport}\n` : ""}Выберите опции: `,
                    name: 'id',
                    choices: [].concat(menuDataResultOptions)
                }
            ]
        )
        .then(
            answer => {
                switch (answer.id) {
                    case menuDataResultOptions[0]: /* 'Отобразить в консоли' */
                    case menuDataResultOptions[1]: /* 'Сохранить' */
                    case menuDataResultOptions[2]: /* 'Показать и сохранить' */
                        return answer.id
                    case menuDataResultOptions[3]: /* '<----- Назад' */
                        console.clear();
                        lib.methods.selectTask();
                        return answer.id
                }
            }
        );
}

//--------------------------

/* https://stackoverflow.com/questions/9080085/node-js-find-home-directory-in-platform-agnostic-way
>> These are the reserved /, >, <, |, :, & characters for Linux / Unix system.
Конвертер даты в формат ГГГГ-ММ-ДД чч-мм-сс для файлов
*/
function dateToDateTimeString(date = new Date()) {
    return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDay()).slice(-2)}` +
        ` ` +
        `${('0' + date.getHours()).slice(-2)}-${('0' + date.getMinutes()).slice(-2)}-${('0' + date.getSeconds()).slice(-2)}`
}

function getStatisticStoryPoints(issueTaskMap) {
    let resultData = {};
    let taskKeys = Object.keys(issueTaskMap);
    for (let key of taskKeys) {
        resultData[key] = {};
        let totalSubtaskPoints = 0;
        let totalSubtaskCount = 0;
        if (issueTaskMap[key].subtasks) {
            totalSubtaskPoints = issueTaskMap[key].subtasks.reduce((sum, subtask) => {
                return sum + subtask.fields.customfield_10200
            }, 0);
            totalSubtaskCount = issueTaskMap[key].subtasks.length;
        }
        resultData[key].currentStoryPoints = issueTaskMap[key].selfData.fields.customfield_10200 || -1;
        resultData[key].totalSubtasks = totalSubtaskCount || -1;
        resultData[key].totalSubtaskPoints = totalSubtaskPoints;
    }
    return resultData;
}

function printConsoleStatisticStoryPoints(resultData) {
    let result = "!!! Сторипониты !!!"
    result += "\n";
    result += ["Задача", "Текущие сторипоинты", "Всего подзадач", "Сторипоинты подзадач"]
        .map(cell => (cell + ' '.repeat(30)).slice(0, 30))
        .join("");
    result += "\n";
    for (let key in resultData) {
        result += [key, resultData[key].currentStoryPoints, resultData[key].totalSubtasks, resultData[key].totalSubtaskPoints]
            .map(cell => (cell + ' '.repeat(30)).slice(0, 30))
            .join("");
        result += "\n";
    }
    result += "\n";
    result += "\n";
    console.log(result);
    return result;
}

function csvStatisticStoryPoints(resultData) {
    let result = ["Задача", "Текущие сторипоинты", "Всего подзадач", "Сторипоинты подзадач"]
        .map(cell => `"${cell}"`)
        .join(";");
    result += "\n";
    for (let key in resultData) {
        result += [key, resultData[key].currentStoryPoints, resultData[key].totalSubtasks, resultData[key].totalSubtaskPoints]
            .map(cell => `"${cell}"`)
            .join(";");
        result += "\n";
    }

    result = '\ufeff' + result; /* utf-8 magic */
    fs.mkdir(reportRootDir, (err) => {
    }); /* create dir if not exist */
    let dateTimeString = dateToDateTimeString();
    let reportPath = path.join(reportRootDir, "/storypoints_" + dateTimeString + ".csv");
    fs.writeFileSync(reportPath, result);
    console.log("Файл сохранен: " + reportPath);
    return result;
}

function getStatisticCommand(issueTaskMap) {
    /* by command */
    let teams = ["FRONT", "DESIGN", "ОМНИ", "DEVOPS"];
    let teamSubtasks = {};
    let taskKeys = Object.keys(issueTaskMap);
    for (let team of teams) {
        teamSubtasks[team] = {
            subtaskCount: 0,
            subtaskPointsCount: 0
        }
    }
    for (let taskKey of taskKeys) {
        let task = issueTaskMap[taskKey];
        if (task.subtasks) {
            for (let subtask of task.subtasks) {
                for (team of teams) {
                    if (subtask.fields.summary.includes(team)) {
                        teamSubtasks[team].subtaskCount += 1;
                        teamSubtasks[team].subtaskPointsCount += subtask.fields.customfield_10200;
                    }
                }
            }
        }
    }
    return teamSubtasks;
}

function printConsoleStatisticCommand(teamSubtasks) {
    let result = "!!! Подзадачи по командам !!!";
    result += "\n";
    result += ["Команда", "Всего подзадач", "Сторипоинты подзадач"]
        .map(cell => (cell + ' '.repeat(30)).slice(0, 30))
        .join("");
    result += "\n";
    for (let key in teamSubtasks) {
        result += [key, teamSubtasks[key].subtaskCount, teamSubtasks[key].subtaskPointsCount]
            .map(cell => (cell + ' '.repeat(30)).slice(0, 30))
            .join("");
        result += "\n";
    }
    result += "\n";
    result += "\n";
    console.log(result);
    return result;

}

function csvStatisticCommand(teamSubtasks) {
    let result = ["Команда", "Всего подзадач", "Сторипоинты подзадач"]
        .map(cell => `"${cell}"`)
        .join(";");
    result += "\n";
    for (let key in teamSubtasks) {
        result += [key, teamSubtasks[key].subtaskCount, teamSubtasks[key].subtaskPointsCount]
            .map(cell => `"${cell}"`)
            .join(";");
        result += "\n";
    }

    result = '\ufeff' + result; /* utf-8 magic */
    fs.mkdir(reportRootDir, (err) => {
    }); /* create dir if not exist */
    let dateTimeString = dateToDateTimeString();
    let reportPath = path.join(reportRootDir, "/commandstats_" + dateTimeString + ".csv");
    fs.writeFileSync(reportPath, result);
    console.log("Файл сохранен: " + reportPath);
    return result;

}


exports.reportMenuMain = reportMenuMain;
exports.reportMenuResultOptions = reportMenuResultOptions;
