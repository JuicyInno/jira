const child_process = require('child_process');

//--------------------------

// вытаскиваем текущую ветку
function currentBrunch(all = false) {
    const url = child_process.execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    return all ? url : url.split('/')[1];
}

// вытаскиваем текущий репо и проект флаг пр - урл для создания пр
function currentRepoLink(pr = true) {
    const url = child_process.execSync('git config --get remote.origin.url').toString().trim().split('/');
    return pr? `${global.bitbucket.host}/rest/api/1.0/projects/${url[url.length - 2]
        }/repos/${url[url.length - 1].split('.')[0]}/pull-requests`:
        {project:url[url.length - 2],repo:url[url.length - 1].split('.')[0]};
}
//--------------------------
exports.currentBrunch = currentBrunch;
exports.currentRepoLink = currentRepoLink;

