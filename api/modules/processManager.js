const {spawn} = require('child_process')
const servers = new Map();

function sendCommand(serverName,command) {
    const proc = servers.get(serverName)
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

function startServer(name,startScript) {
    const proc = spawn('java', [
        '-Xmx512M',
        '-Xms256M',
        '-jar',
        'spigot-1.13.2.jar',
        'nogui'
    ],{cwd:'D:\\Servers\\spigot_battle'})
    function log(data) {
        process.stdout.write(data.toString());
    }
    proc.stdout.on('data', log);
    proc.stderr.on('data', log);

    servers.set(name,proc);
}

module.exports = {sendCommand, startServer};