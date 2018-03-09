var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);


const ClientManager = require('./ClientManager');
const ChatroomManager = require('./ChatroomManager');

const clientManager = ClientManager();
const chatroomManager = ChatroomManager();

function broadcastMessage(roomId, key, message) {
    chatroomManager.getRooms().get(roomId).clients.forEach(
        m => m.emit(key, message)
    );
}

io.on('connection', function (socket) {
    socket.on('register', function (nickname) {
        clientManager.addClient(socket, nickname);
        socket.emit('registered');
    });

    socket.on('create', function () {
        console.log('chce vytvořit');
        var roomId = makeId();
        var room = chatroomManager.createRoom(roomId, socket);
        socket.emit('created', {
            'roomId': room.id,
            'users': room.playersCurrent,
        });
    });

    socket.on('join', function (id) {
        var room = chatroomManager.getRoomById(id);
        if (room) {
            if (room.playersCurrent >= room.playersMax) {
                socket.emit('joined', {'status': '1', 'count': '0'});
            } else {
                chatroomManager.addUser(id, socket);
                var count = chatroomManager.getUsersCount(id);
                broadcastMessage(id, 'joined', {'status': '3', 'count': count});
            }
        } else {
            socket.emit('joined', {'status': '2', 'count': '0'});
        }
    });

    socket.on('leave', function () {

    });

    socket.on('message', function () {

    });

    socket.on('chatrooms', function () {

    });

    socket.on('print', function () {

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


function makeId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}