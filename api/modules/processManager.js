const {spawn} = require('child_process')
const fileManager = require('./fileManager')
const servers = new Map();
let io;

function init(_io) {
    io = _io
    _io.on('connection',(socket) => {
        socket.on('init',(id) => {
            console.log(`${socket.id} join room -> ${id}`)
            socket.join(id)
        })
        console.info(`[socket] ${socket.id} connected`)
        socket.on('command',msg => {
            console.log(`[socket] ${socket.id} cmd: `,msg)
            const id = getLastID(socket.rooms)
            const proc = servers.get(id)
            console.log('map_keys',servers.keys())
            if(!proc) return console.log('command when server offline'); //silent fail
            proc.stdin.write(msg+"\n")
            
        })
    })
    
}

function getLastID(obj) {
    const a = Object.keys(obj);
    return a[a.length-1];
}

function sendCommand(serverName,command) {
    const proc = servers.get(serverName)
    if(!proc) throw new Error('Server is offline')
    proc.stdin.write(command+"\n")

    const buffer = [];
    const collector = (data) => {
        data = data.toString();
        buffer.push(data.split(']: ')[1]);
    };
    proc.stdout.on('data', collector);
    setTimeout(function() {
        proc.stdout.removeListener('data', collector);
        return buffer.join('');
    }, 250);

}

function startServer(server) {
    return new Promise(async(resolve,reject) => {
        console.debug(`[debug] run ${server.type}`,server.mc)
        if(server && Object.keys(server).length > 0) {
            let starter = "";
            let args = [];
            if(server.type === 'sourcemod') {
                starter = server.starter||'./srcds_run'
            }else if(server.type === 'minecraft') {
                try {
                    await fileManager.manageJar(server.mc.version,server.mc.jar)
                    starter = 'java'
                    args = [`-Xmx${server.mc.memory}M`,`-jar`,`server.jar`,`nogui`]
                }catch(ex) {
                    reject(ex)
                }
            }else{ 
                reject(new Error('Invalid server type'))
            }
            console.log("spawn: ",starter,args)
            const process = spawn(starter,args,{cwd:server.path});
            process.stdout.on('data', (data) => {
                io.to(server._id).emit('out',data.toString())
            })
            process.stderr.on('data', (data) => {
                io.to(server._id).emit('err',data.toString())
            })
            console.log('store',server._id,'success')
            servers.set(server._id.toString(),process);
            resolve();
        }else{
            throw new Error("Server is null or an empty object");
        }
    })
}

// function startServer(name,startScript) {
//     const proc = spawn('java', [
//         '-Xmx512M',
//         '-Xms256M',
//         '-jar',
//         'spigot-1.13.2.jar',
//         'nogui'
//     ],{cwd:'D:\\Servers\\spigot_battle'})
//     function log(data) {
//         io.to()
//         process.stdout.write(data.toString());
//     }
//     proc.stdout.on('data', log);
//     proc.stderr.on('data', log);

//     servers.set(name,proc);
// }

module.exports = {sendCommand, startServer, init};