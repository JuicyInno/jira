const inquirer = require('inquirer');

let lib = require('./../create');

//--------------------------------------------------------------
const menu = ["[FRONT]", "[BACK]", "[QA]", "[DESIGN]", "All"];

function resultGetTasks(data) {
    let USEREALNAME = ' на вас нет задач';
    const USERNAME = global.auth.USERNAME;
    const r = data.map((i, idx) => {
        (!i.fields.assignee) && (i.fields.assignee = {
            displayName: 'не присвоен',
            name: ''
        });
        (USERNAME.toLocaleUpperCase() === i.fields.assignee.name.toLocaleUpperCase()) && (USEREALNAME = i.fields.assignee.displayName);

        delete i.expand;
        delete i.self;
        delete i.id;
        // console.log(i)
        i.name = `${(idx + 1)})${i.key} [${(i.fields.status?.name+(i.fields.labels?.length && i.fields.status?.name==='Выполнено'?' '+i.fields.labels[0]:'')).slice(0,15)}]/${i.fields.summary}`;
        i.name = (i.name + ' '.repeat(1000)).slice(0, 130);
        /* парсинг спринта */
        //
        // i.name = `${(idx + 1)})${i.key} [${(i.fields.status?.name+'     ').slice(0,8)}]/${i.fields.summary} `;
        // i.name = (i.name + ' '.repeat(1000)).slice(0, 130);
        // i.name +=i.fields.customfield_10100[0].split('name=')[1].split(',startDate')[0]+' / '

        /* название спринта */
        // i.name += ((i.fields.customfield_10100[0] || "").match(/(?<=name=)([^,]*)(?=,)/gm) || [])[0];
        /* строка дата начала спринта */
        const sprintStartDate = ((i.fields.customfield_10100[0] || "").match(/(?<=startDate=)([^,]*)(?=,)/gm) || [])[0];
        /* строка дата окончания спринта */
        const sprintEndDate = ((i.fields.customfield_10100[0] || "").match(/(?<=endDate=)([^,]*)(?=,)/gm) || [])[0];
        const today = new Date();
        if(sprintStartDate && sprintEndDate){
            if(today > new Date(sprintEndDate)){
                i.name += "!!!!!!!!!!Закрытый спринт!!!!!!!!!!!!! __ ";
            } else
            if(today < new Date(sprintStartDate)){
                i.name += "!!!!!!!!!!Будущий спринт!!!!!!!!!!!!!! __ ";
            } else {
                i.name += "";
            }
        } else {
            i.name += "Спринт не опред.";
        }

        i.name += `${(USERNAME.toLocaleUpperCase()  === i.fields.assignee.name.toLocaleUpperCase() ) ? '!!!Я!!!!' : i.fields.assignee.displayName}`;
        i.value = i.key;
        delete i.key;
        i.description = i.fields.description;
        i.created = new Date(i.fields.created);
        /*
            "status": {
                "name": "В работе",
                "id": "11003",
                ...
            }
        */
        i.taskStatusOnWork = i.fields.status.id === "11003";
        delete i.fields;
        return i;
    }).sort((a, b) => (a.value > b.value ? -1 : 1));
    inquirer
        .prompt([{
            type: 'list',
            message: 'Select toppings',
            name: 'id',
            choices: [
                new inquirer.Separator(` = ЗАДАЧИ ( ${USEREALNAME}) = `)
            ].concat(r).concat(['<----- Назад'])
        }
        ])
        .then((answers) => {
            const tst = r.find(i => i.value === answers.id);
            tst ? lib.methods.storyAction(tst) : lib.methods.selectTask();
        });
}

function getTasks(all = false) {
    console.clear();
    if (all) {
        inquirer
            .prompt([{
                type: 'list',
                message: 'Select toppings',
                name: 'id',
                choices: menu
            }
            ])
            .then((answers) => {
                lib.methods.getStory(answers.id, resultGetTasks);
            });
    } else {
        lib.methods.getStory("All", resultGetTasks);
    }
}

exports.getTasks = getTasks;
