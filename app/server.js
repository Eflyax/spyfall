var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);


const ClientManager = require('./ClientManager');
const ChatroomManager = require('./ChatroomManager');
const makeHandlers = require('./handlers');

const clientManager = ClientManager();
const chatroomManager = ChatroomManager();

io.on('connection', function (socket) {
    io.emit('message', 'Nové připojení...');
    console.log('Client connected');

    socket.on('register', function (nickname) {
        clientManager.addClient(socket, nickname);
        console.log(nickname + ' registered');
        io.emit('registered');
    });

    socket.on('join', function () {

    });

    socket.on('leave', function () {

    });

    socket.on('message', function () {

    });

    socket.on('chatrooms', function () {

    });

    socket.on('availableUsers', function () {

    });

    socket.on('disconnect', function () {
        console.log('client disconnect...', socket.id);
    });

    socket.on('error', function (err) {
        console.log('received error from client:', socket.id);
        console.log(err)
    });

    socket.on("*", function (event, data) {
        console.log(event);
        console.log(data);
    });
});

server.listen(3000, function (err) {
    if (err) throw err;
    console.log('listening on port 3000')
});

app.get('*', function (req, res) {
    var uid = req.params.uid,
        path = req.params[0] ? req.params[0] : 'index.html';
    res.sendFile(path, {root: './public'});
});
