
if(!process.env.MONGODB_URI) throw 'Missing MONGODB_URI environmental variable. Please provide.'

const MongoClient = require('mongodb').MongoClient;
const {exec} = require('child_process')

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
module.exports = {init, getOne, getDB, execShellCommand, io};

