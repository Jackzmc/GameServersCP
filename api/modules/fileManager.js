const fs = require('fs').promises
const path = require('path')
const semver_reg = new RegExp(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$/)


exports.start = async() => {
    fs.mkdir(path.join(__dirname,'../../data')).catch(() => {})
}
function downloadJar(type,version) {
    return new Promise((resolve,reject) => {
        switch(jar) {
            case "vanilla":
                break;
            case "spigot":
                break;
            case "paper":
                break;
            case "sponge":
                break;
            default:
                reject(new Error('Unknown jar type'))
        }
    })
}

exports.checkJar = (type,version) => {
    return new Promise((resolve,reject) => {
        if(version == 'latest') {
            //set to correct
        }
        if(!semver_reg.test(version)) {
            reject(new Error('Invalid version'))
        }
        fs.stat(`${path.join(__dirname,"../../data")}/${type}/${version}.jar`).then(r => {
            resolve();
        }).catch(err => {
            console.log(`[fileManager] Jar not found: ${type}/${version}.jar`)
            resolve();
            //reject(new Error('fail'))
            //create jar
        })
    })
}

/*server prop: {
    _id,
    type:'sourcegame' || 'minecraft',
    starter:'./srcds_run' || 'spigot-jar'
}*/

//each server will have own mc version



//https://papermc.io/api/v1/paper/1.14.4/latest/download
//java -jar --cp JARNAME.jar 