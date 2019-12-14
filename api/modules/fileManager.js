const fs = require('fs').promises
const path = require('path')
exports.start = async() => {
    if(!process.env.ROOT_SERVER_DIR) {
        fs.mkdir(path.join(__dirname,'../../servers'))
        .then(() => console.log('[fileManager] Created servers/ directory. Change with env ROOT_SERVER_DIR'))
        .catch(() => {})
    }
    fs.mkdir(path.join(__dirname,'../../setup')).catch(() => {})
}
exports.manageJar = (version,jar) => {
    switch(jar) {
        case "vanilla":
            break;
        case "spigot":
            break;
        case "paper":
            break;
        case "sponge":
            break;
    }
}

/*server prop: {
    _id,
    type:'sourcegame' || 'minecraft',
    starter:'./srcds_run' || 'spigot-jar'
}*/

//each server will have own mc version



//https://papermc.io/api/v1/paper/1.14.4/latest/download
//java -jar --cp JARNAME.jar 