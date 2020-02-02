
if(!process.env.MONGODB_URI) throw 'Missing MONGODB_URI environmental variable. Please provide.'

const appids = require('./appids.json');
const {ObjectId,MongoClient} = require('mongodb');
const {exec} = require('child_process')
const fs = require('fs').promises
const path = require('path')

//const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
let _db, io;

function init(server,io) {
    this.io = io;
    const PORT = process.env.WEB_PORT||8080;
    MongoClient.connect(process.env.MONGODB_URI,{ useUnifiedTopology: true }).then(database => {
        console.info('[mongodb] Connected')
        //const collection = client.db("gameservercp").collection("servers");
        _db = database.db("gameservercp")
        server.listen(PORT,() => {
            console.info('[server] Listening on :' + PORT)
        })
    }).catch(err => {
        throw err;
    })

}
function execShellCommand (cmd,opts = {}) {
    return new Promise((resolve, reject) => {
        exec(cmd, opts, (error, stdout, stderr) => {
            if(error) return reject(error);
            return resolve(stdout?stdout:stderr)
        });
    });
}
async function getOne(cursor) {
    if(await cursor.hasNext()) {
        return await cursor.next();
    }
    return {};
}

function getDB() {
    return _db;
}
function getGameDir(appid) {
    return appids.find(v => v.appid == appid).gamedir||null;
}

function getServerDir() {
    if(!process.env.ROOT_SERVER_DIR) {
        const _path = path.join(__dirname,'../../servers');
        fs.mkdir(_path)
        .then(() => {
            console.info('[util] Created default servers/ directory. Change with env ROOT_SERVER_DIR')
        })
        .catch(() => {
        })
        return _path;
    }else{
        return path.normalize(process.env.ROOT_SERVER_DIR)
    }
}
function getId(input) {
    try {
        const id = new ObjectId(input)
        return {$in: [input, id]}
    }catch(ex) {
        return input;
    }
}
function findAvailablePort(type, port = null) {
    return new Promise((resolve,reject) => {
        //get default port from env
        if(!port) {
            if(process.env.START_PORTS) {
                port = process.env.START_PORTS
            }else{
                if(type === 'minecraft') {
                    port = process.env.START_MINECRAFT_PORTS||25565;
                }else if(type === 'sourcegame') {
                    port = process.env.START_SOURCE_PORTS||27015
                }else{
                    return reject(new Error('Unknown gametype.'))
                }
            }
            console.debug('Finding port: ', port)
        }else{
            //add one to port
            if(isNaN(port)) return reject(new Error('Port is not valid'))
            port = parseInt(port) + 1;
        }
        //test if available
        _db.collection("servers").findOne({port:port.toString()},{project:{_id:0,port:1}}).then((r) => {
            if(r != null) {
                resolve(findAvailablePort(type,port))
            }else{
                resolve(port)
            }
        }).catch(err => {
            reject(err)
        }) 
    })
    
}
function fromEntries(array) {
    return array.reduce((prev,curr) => {
        prev[curr[0]] = curr[1] ;
        return prev;
    },{})
}
module.exports = {init, getOne, getDB, execShellCommand, io, getServerDir, getId,  findAvailablePort, getGameDir, fromEntries};

