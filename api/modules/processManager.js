const {spawn} = require('child_process')
const propParser = require("properties-file");
const path = require('path')
const fs = require('fs').promises

const {getServerDir} = require('./util')
const fileManager = require('./fileManager')
const servers = new Map();
let io;

function init(_io) {
    io = _io
    _io.on('connection',(socket) => {
        socket.on('init',(id) => {
            console.log(`[socket] ${socket.id} join room -> ${id}`)
            socket.join(id)
        })
        console.info(`[socket] ${socket.id} connected`)
        socket.on('command',(msg, fn) => {
            const id = getLastID(socket.rooms)
            const proc = servers.get(id)
            console.log('[socket/command] map_keys',servers.keys())
            if(proc) {
                proc.stdin.write(msg+"\n")
                console.log(`[socket] ${socket.id} cmd: `,msg)
                fn({success:true})
            }else{
                console.log('command when server offline');
                return fn({error:'Server is offline'})

            }
            
        })
    })
    
}

function isServerRunning(server) {
    return servers.has(server._id)
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
        console.debug(`[debug] run ${server.type}`,`"/${server._id}"`,server.mc)
        if(server && Object.keys(server).length > 0) {
            let starter = "";
            let args = [];
            switch(server.type) {
                case "sourcegame":
                    const default_process = (process.platform === "win32") ? "srcds.exe" : "./srcds_run"
                    args = ['-console'];
                    starter = server.starter||default_process
                    break;
                case "minecraft":
                    try {
                        await fileManager.checkJar(server.mc.jar,server.mc.version,)
                        starter = 'java'
                        args = [`-Xmx${server.mc.memory}M`,`-jar`,`spigot-1.13.2.jar`,`nogui`]
                    }catch(ex) {
                        return reject(ex)
                    }
                    break;
                default:
                    return reject(new Error('Invalid server type.'));
            }
            if(!starter) return console.debug('[proc] Starter is null, skipping'); //if starter ignore, silent (rejected above)
            console.log("[debug] spawn: ",starter,args)
            try {
                const _path = path.join(getServerDir(),server._id.toString())
                console.log('[debug]',_path)
                const process = spawn(starter,args,{cwd:_path,shell:true});

                process.on('close',(code,signal) => {
                    console.log('[proc]','Server',server._id,'closed. Code:',code,' Signal:',signal)
                    const reason = (code) ? `code ${code}` : `signal ${signal}`
                    io.to(server._id).emit('out',`[NOTICE] Server has been stopped with ${reason}\n`)
                    servers.delete(server._id)
                })
                process.on('error',(err) => {
                    console.log('[proc/error]',err.message)
                    reject(err)
                })
                process.stdout.on('data', (data) => {
                    console.log('[debug:out]',`[${server._id}]`,data.toString())
                    io.to(server._id).emit('out',data.toString())
                })
                process.stderr.on('data', (data) => {
                    console.log('[debug:err]',`[${server._id}]`,data.toString())
                    io.to(server._id).emit('err',data.toString())
                })
                console.log('[debug]',server._id,'start success')
                servers.set(server._id.toString(),process);
                resolve();
            }catch(err){
                reject(err)
            }
        }else{
            throw new Error("Server is null or an empty object");
        }
    })
}

let updating_servers = [];
function updateAppId(server) {
    return new Promise(async(resolve,reject) => {
        const _path = path.join(getServerDir(),server._id.toString());
        const steamcmd = `"${path.join(process.env.STEAMCMD_PATH,(process.platform === "win32") ? 'steamcmd.exe' : 'steamcmd.sh')}"`
        if(!server.appid || server.type != "sourcegame") return reject(new Error('Server is missing appid or is not a sourcegame'))
        if(updating_servers.includes(server._id)) {
            return reject(new Error('Server is already updating'))
        }
        //make sure folder struc exists, silence err
        await fs.mkdir(_path,{recursive:true})
        .catch(() => {

        })

        //spawn steamcmd proc w/ args to login anon, set install dir, and feed appid.
        const proc = spawn(steamcmd,[
            '+login','anonymous','+force_install_dir',`"${_path}"`,'+app_update',server.appid.toString().trim(),'validate','+quit'
        ],{cwd:_path,shell:true})
        console.info(`Updating server appid ${server.appid}. cwd: ${_path}`)

        //store server in list of servers that are updating. don't want duplicate updates
        updating_servers.push(server._id)

        //either on close or full exit
        proc.on('close',(code,signal)  => {
             //remove id of server from list of updating servers
            const index = updating_servers.findIndex(v => v === server._id);
            updating_servers.splice(index,1);
            if(code === 0) {
                io.to(server._id).emit('out','[NOTICE] Server app update has been completed.\n')
                resolve();
            }else{
                reject(signal||code)
            }
        })
        proc.on('exit',(code,signal)  => {
            if(code !== 0) {
                 //remove id of server from list of updating servers
                const index = updating_servers.findIndex(v => v === server._id);
                updating_servers.splice(index,1);
                reject(signal||code)
            }
        })

        proc.on('error',(err) => {
            //remove id of server from list of updating servers
            const index = updating_servers.findIndex(v => v === server._id);
            updating_servers.splice(index,1);
            reject(err)
        })
        //send the update process data to console socket
        proc.stdout.on('data',data => {
            io.to(server._id).emit('out',data.toString())
        })
        process.stderr.on('data', (data) => {
            io.to(server._id).emit('err',data.toString())
        })
    })
    /* steamcmd.sh|steamcmd.exe +login anonymous +force_install_dir <dir> +app_update ${appid} validate +quit */
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

function getConnectDetails(server) {
    return new Promise((resolve,reject) => {
        switch(server.type) {
            case "minecraft":
                fs.readFile(path.join(getServerDir(),server._id.toString(),"/server.properties"),'utf-8').then(server_prop => {
                    const properties = propParser.parse(server_prop)
                    return resolve({
                        ip:properties['server-ip']||'0.0.0.0',
                        port:properties['server-port']||25565
                    })
                }).catch(() => reject(err))
                break;
            case "sourcegame":
                //not implemented
                return resolve({
                    ip:'0.0.0.0',
                    port:'27015'
                })
        }
    })
    
}

module.exports = {sendCommand, startServer, updateAppId, init, getConnectDetails, isServerRunning};