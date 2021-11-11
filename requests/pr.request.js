const child_process = require('child_process');
const lib = require('./../create')

const {log} = require("./../utils/log");
const request = require('request');

/* создание пр */
function createPr(callback = () => {
}) {
    const data = {
        method: 'POST',
        url: lib.utils.currentRepoLink(),
        strictSSL: false,
        auth: {
            username: global.auth.USERNAME,
            password: global.auth.PASSWORD
        },
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: `{
    "title": "${lib.utils.currentBrunch(true)}",
    "description": "",
    "state": "OPEN",
    "open": true,
    "closed": false,
    "fromRef": {
        "id": "${lib.utils.currentBrunch(true)}"
    },
    "toRef": {
        "id": "${global.bitbucket.mainBranchName}"
    }
    
}`
    };


    /* todo: проверять наличие ветки в репозитории */
    /* todo: разобраться с магией ниже */
    const tmp = child_process.execSync('git status -s').toString().trim().split('\n').filter(i =>i!=='') //.filter(i => !~i.indexOf('.'));
    if (tmp.length) {
        log('error', `Не закомиченные файлы`)
        console.log(tmp);
        console.log("");
        callback();
    } else {
        child_process.execSync(`git pull origin ${global.bitbucket.mainBranchName}`);
        request(data, function (error, response) {

            if (error) throw new Error(error);

            child_process.execSync(`git checkout ${global.bitbucket.mainBranchName}`);
            child_process.execSync(`git fetch`);
            log("info", ` Pull request  успешно создан. Выполнен переход в ветку ${global.bitbucket.mainBranchName}. Ссылка:
           ${JSON.parse(response.body).links.self[0].href}
            `);


            callback();
        });
    }


}

//--------------------------
exports.createPr = createPr;
