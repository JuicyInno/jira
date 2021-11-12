const inquirer = require('inquirer');
const {Subject} = require('rxjs');
const lib = require('./../create');
const {log} = require('./../utils/log');
const fs = require('fs');
const path = require('path');
const {parse} = require("request/lib/cookies");
//-------------------------
// сообщение
let message = undefined;
// потраченное время
let time = undefined;
// подтверждение
let conf = undefined;
// текущая таска
let taskId = undefined;
// версия
let version = undefined;
let defaultVersion = undefined;


const sub = new Subject();

//======================================================================================================================


function callbackSpendTime() {
    /* todo: данный метод перезатрет остальные метки. в идеале читать старые и к ним добавлять новые значения */
    // lib.requests.setIssueLabels(taskId, [version], () => {
    //     lib.requests.closeTask(taskId, message, () => lib.methods.selectTask());
    // });
    lib.requests.setIssueLabels(taskId, [version]);
    lib.requests.closeTask(taskId, message, () => lib.methods.selectTask());
    log('info', "Задача успешно закрыта, метки обновлены, время учтено. Не забудте сделать PR.");
}


function requestClosetask(t) {
    console.log(t);
    taskId = t;
    /* парсинг версии из package.json и вычисление нового значения (исп. по умолчанию) */
    try {
        let currVersion = JSON.parse(
            fs.readFileSync(path.join(process.cwd(), "./package.json"), {encoding: 'utf8', flag: 'r'})
        )
            .version
            .split(".");
        if (isNaN(currVersion[currVersion.length - 1])) {
            throw "invalid version name";
        }
        currVersion[currVersion.length - 1] = parseInt(currVersion[currVersion.length - 1]) + 1;
        defaultVersion = currVersion.join(".");
    } catch (e) {
        // console.error("!!! defaultVersion calculation failed !!! ");
        // console.error(e);
        defaultVersion = undefined;
    }

    // основная подписка
    inquirer.prompt(sub).ui.process.subscribe((q) => {
        message = (q.name === 'message') ? q.answer : message;
        time = (q.name === 'time') ? q.answer : time;
        conf = (q.name === 'conf') ? q.answer : conf;
        version = (q.name === 'version') ? q.answer || defaultVersion : version;
        if (!conf) {
            if ((message && time && version) && conf === undefined) apply();
            if (conf === false) { /* todo: исправить повторное выполнение при выборе нет */
                conf = time = message = version = undefined;
                req();
            }
        } else {
            sub.unsubscribe();
            lib.requests.spendTime(taskId, message, time, callbackSpendTime);
        }
    });
    req();
}

function apply() {
    sub.next({
            type: 'confirm',
            message: `Задача: ${taskId}
Версия: ${version}
Коммент: ${message}
Время: ${time.slice(0, 2) + ' час ' + time.slice(2, 4) + ' минут'} верно?`,
            name: 'conf'
        }
    );
}


// зацикленная функция
function req() {
    sub.next({
            type: 'input',
            message: `Напишите комментарий:`,
            name: 'message'
        }
    );
    sub.next({
        type: 'input',
        message: `Сколько часов потрачено на задачу (пример 00.45) `,
        name: 'time',
        validate: (t => {
            const val = !isNaN(t) && t.length <= 4;
            (!val) && console.log(`Не верный формат (${t})!!`);
            return val;
        }),
        transformer: (t => {
            if (t.length > 2) {
                t = t.slice(0, 2) + ' час ' + t.slice(2) + ' минут';
            }
            if (t.length > 15) {
                t = t.slice(0, 15);
            }
            return t;
        })
    });
    sub.next({
        type: 'input',
        message: `Укажите версию исправления${defaultVersion ? ` (инкремент по умолч.: ${defaultVersion})` : ""}: `,
        name: 'version'
    });
}

//--------------------------
exports.requestClosetask = requestClosetask;
