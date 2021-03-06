const inquirer = require('inquirer');
const lib = require('./../create');
const {log} = require('./../utils/log');

//--------------------------
global.REQ = '';
const menuData = [
    'Мои задачи',
    'Мои задачи в текущем спринте',
    'Все задачи в текущем спринте',
    'Закрыть текущую задачу',
    'Забацать PullRequest',
    'Отчетность',
    'ВЫЙТИ'
];


function selectTask() {
    inquirer.prompt([{
        type: 'list',
        message: 'Выберете действие (отображаются ТОЛЬКО поздадачи):',
        name: 'id',
        choices: [].concat(menuData)
    }]).then(answers => {
        switch (answers.id) {
            case menuData[0]: /* 'Мои задачи' */
                global.REQ = `assignee=currentuser() AND project=${global.jira.project} AND status not in (Закрыто )`;
                lib.methods.getTasks();
                break;
            case menuData[1]: /* 'Мои задачи в текущем спринте todo  заменить на openSprints()*/
                global.REQ = `assignee=currentuser() AND project=${global.jira.project} AND  status not in (Закрыто) AND (Sprint  in (openSprints()) )`;
                lib.methods.getTasks();
                break;
            case menuData[2]: /* 'Все задачи в текущем спринте' */
                global.REQ = `project=${global.jira.project} AND status not in (Закрыто) AND (Sprint  in (openSprints()) )`;
                lib.methods.getTasks(true);
                break;
            case menuData[3]: /* 'Закрыть текущую задачу' */
                lib.utils.currentBrunch() ?
                    lib.methods.requestClosetask(lib.utils.currentBrunch()) :
                    log('error', `
                        ${lib.utils.currentBrunch()}
                        !!!!!!!!!!!!! Не верный формат ветки в гите !!!!!!!!!!!!!!!!!!!`, lib.methods.selectTask);
                break;
            case menuData[4]: /* 'Забацать PullRequest' */
                lib.utils.currentBrunch() ?
                    lib.requests.createPr(lib.methods.selectTask) :
                    log('error', '!!!!!!!!!!!!! Не верный формат ветки в гите !!!!!!!!!!!!!!!!!!!', lib.methods.selectTask);
                break;
            case menuData[5]: /* 'Отчетность' */
                lib.methods.reportMenuMain();
                break;
            case menuData[6]: /* 'ВЫЙТИ' */
                break;
        }
    });
}

//--------------------------


exports.selectTask = selectTask;
