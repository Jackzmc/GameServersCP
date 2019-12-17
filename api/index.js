require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
app.io = io;

require('./modules/fileManager').start();
require('./modules/util').init(server,io);


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/api/',require('./routes/api'));
app.use(express.static('../ui/dist'))

app.get('*',(req,res) => {
    res.status(404).send("<title>404 Not Found</title><center><h1>404 Not Found</h1><hr>GameServerCP</center>")
})
