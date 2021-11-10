const inquirer = require('inquirer');

let lib = require('./../create');

//--------------------------------------------------------------
const menu = ["[FRONT]", "[BACK]", "[QA]", "[DESIGN]", "All"];

function resultGetTasks(data) {
    let USEREALNAME = ' на вас нет задач';
    const USERNAME = global.auth.USERNAME;
    let b=true
    const r = data.map((i, idx) => {
        (!i.fields.assignee) && (i.fields.assignee = {
            displayName: 'не присвоен',
            name: ''
        });
        (USERNAME.toLocaleUpperCase() === i.fields.assignee.name.toLocaleUpperCase()) && (USEREALNAME = i.fields.assignee.displayName);

        delete i.expand;
        delete i.self;
        delete i.id;
        // if(b){
        //      console.log('i',i)
        //   //  console.log(i.fields.customfield_10100[0].split('name=')[1].split(',startDate')[0])
        //     b=false
        // }

        i.name = `${(idx + 1)})${i.key} [${(i.fields.status?.name+'     ').slice(0,8)}]/${i.fields.summary} `;
        i.name = (i.name + ' '.repeat(1000)).slice(0, 130);
        i.name +=i.fields.customfield_10100[0].split('name=')[1].split(',startDate')[0]+' / '

        i.name += `${(USERNAME.toLocaleUpperCase()  === i.fields.assignee.name.toLocaleUpperCase() ) ? '!!!Я!!!!' : i.fields.assignee.displayName}`;
        i.value = i.key;
        i.description = i.fields.description;
        delete i.key;
        i.created = new Date(i.fields.created);
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
