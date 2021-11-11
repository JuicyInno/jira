const inquirer = require('inquirer');
const child_process = require('child_process');
const menuData1 = ['Создать ветку', 'Показать описание задачи', 'Назначить на меня', 'Закрыть задачу в jira', '<----- Назад'];
const lib = require('./../create');
const {log} = require("./../utils/log");


 function storyAction(answers) {

    inquirer
        .prompt([{
            type: 'list',
            message: `Что делаем с задачей ${answers.value}?`,
            name: 'id',
            choices: [].concat(menuData1)
        }
        ])
        .then(a => {
            switch (a.id) {

                case menuData1[0]:
                    lib.requests.assigneeTaskTo(answers.value, () => {
                        lib.requests.toWork(answers.value, '',()=>{
                            try {

                                child_process.exec(`git checkout -b feature/${answers.value} ${global.bitbucket.mainBranchName}`);
                                child_process.exec(`git checkout feature/${answers.value}`);
                                child_process.exec(`git push --set-upstream origin HEAD`);
                                child_process.exec(`git pull origin ${global.bitbucket.mainBranchName}`);

                                log("info",`Задача переведена в работу`);

                                log("info",`Ветка feature/${answers.value} успешно создана`);
                            }catch(e){
                                console.log(`Ошибка:`,e);
                            }


                        } );

                    });



                    break;
                case menuData1[1]: /* 'Показать описание задачи' */
                    console.log(`*************************************************************
*************************************************************
          ${answers.description}
*************************************************************
*************************************************************`);
                    storyAction(answers);
                    break;
                case menuData1[2]: /* 'Назначить на меня' */
                    lib.requests.assigneeTaskTo(answers.value, () => storyAction(answers));


                    break;
                case menuData1[3]: /* 'Закрыть задачу в jira' */
                    if(!answers.taskStatusOnWork){
                        throw new Error("задача не в работе!; переведите задачу в статус \"В Работе\" и перезапустите приложение");
                    }
                    lib.methods.requestClosetask(answers.value);
                    break;
                case menuData1[4]: /* '<----- Назад' */
                    console.clear();
                    lib.methods.getTasks();
                    break;
            }

        });
}

//--------------------------
exports.storyAction = storyAction;
