const sprintsHelper = require("./sprints")


function getIssuesWithPointDiff(issueMap) {
    let issuesWithDiff = {};
    for (let key in issueMap) {
        let task = issueMap[key];
        let totalSubtaskPoints = 0;
        if (task.subtasks && Object.keys(task.subtasks).length !== 0) {
            totalSubtaskPoints = task.subtasks.reduce((sum, subtask) => {
                return sum + subtask.fields.customfield_10200
            }, 0);
            if (totalSubtaskPoints && totalSubtaskPoints !== task.selfData.fields.customfield_10200) {
                issuesWithDiff[key] = {
                    curr: task.selfData.fields.customfield_10200,
                    calc: totalSubtaskPoints
                }
            }
        }
    }
    return issuesWithDiff;
}


function calcRemainingEstimate(
    issueMap,
    teamMembersCount = global.jira.teamMembersCount,
    sprintDaysCount = global.jira.sprintDaysCount
) {
    let taskKeys = Object.keys(issueMap);
    let taskCount = taskKeys.length;
    let timeRequiredTotal = teamMembersCount * sprintDaysCount * 8;
    let timeRequiredTask = Math.round(timeRequiredTotal / taskCount);
    let prevTask = null;
    let randomDiff;
    for (let key in issueMap) {
        let task = issueMap[key];
        if (prevTask) {
            /* create random diff in +-2 */
            randomDiff = Math.round(Math.random() * 10) % 3;
            /* +-2 days */
            randomDiff = randomDiff * 8;
            prevTask.selfData.fields.timetracking.remainingEstimateHours = timeRequiredTask + randomDiff;
            task.selfData.fields.timetracking.remainingEstimateHours = timeRequiredTask - randomDiff;
            prevTask = null;
        } else {
            prevTask = task;
        }
    }
    if (prevTask) {
        prevTask.selfData.fields.timetracking.remainingEstimateHours = timeRequiredTask;
    }
    return issueMap;
}


function initIssueUpdateMap(issueUpdateMap, key) {
    if (issueUpdateMap[key] === undefined) {
        issueUpdateMap[key] = {};
        issueUpdateMap[key].fields = {};
    }
}


/* обновление даты окончания */
function calcIssueDueDate(issueMap, issueUpdateMap, sprint) {
    let dueDate = sprintsHelper.getSprintEndDate(sprint);
    for (let key in issueMap) {
        if (issueMap[key].selfData.fields.duedate !== dueDate) {
            initIssueUpdateMap(issueUpdateMap, key);
            issueUpdateMap[key].fields.duedate = dueDate;
        }
    }
}


/* обновляем названия задачи */
function calcIssueSummary(issueMap, issueUpdateMap, sprint) {
    /* ex: 'Спринт 2021.4.6.SERV' */
    let sprintCode = sprint.name.substring(sprint.name.indexOf(".") + 1, sprint.name.lastIndexOf("."));
    for (let key in issueMap) {
        initIssueUpdateMap(issueUpdateMap, key);
        if (issueMap[key].selfData.fields.summary) {
            if (issueMap[key].selfData.fields.summary.search(/^\d+\.\d+/g) === -1) {
                issueUpdateMap[key].fields.summary = sprintCode + " - " + issueMap[key].selfData.fields.summary;
            }
        }
    }
}


exports.getIssuesWithPointDiff = getIssuesWithPointDiff;
exports.calcRemainingEstimate = calcRemainingEstimate;
exports.calcIssueDueDate = calcIssueDueDate;
exports.calcIssueSummary = calcIssueSummary;