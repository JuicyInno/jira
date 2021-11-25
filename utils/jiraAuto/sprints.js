
/** search active or forthcoming sprint */
function searchTargetSprint(sprintsArr) {
    let targetSprint = null;
    for (let sprint of sprintsArr) {
        if (sprint.state === 'active') {
            targetSprint = sprint;
            break;
        }
        if (sprint.state === 'future') {
            if (!targetSprint) {
                targetSprint = sprint;
                continue;
            }
            if (new Date(targetSprint.startDate) > new Date(sprint.startDate)) {
                targetSprint = sprint;
            }
        }
    }
    return targetSprint;
}

function getSprintEndDate(sprint) {
    return sprint.endDate.substring(0, 10);
}

exports.searchTargetSprint = searchTargetSprint;
exports.getSprintEndDate = getSprintEndDate;