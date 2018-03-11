var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

const C = require('./constants');
const ClientManager = require('./ClientManager');
const ChatroomManager = require('./ChatroomManager');

const clientManager = ClientManager();
const chatroomManager = ChatroomManager();

function broadcastMessage(roomId, messageKey, obj) {
    if (!chatroomManager.getRooms().get(roomId)) {
        return;
    }

    var clientsInRoom = chatroomManager.getRooms().get(roomId).clients;
    clientsInRoom.forEach(function (item, key, mapObj) {
        io.to([key]).emit(messageKey, obj);
    });
}

function print() {
    console.log(clientManager.getClients());
    console.log('_________________________________');
    console.log(chatroomManager.getRooms());
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
}

io.on('connection', function (socket) {
    socket.on('register', function (nickname) {
        clientManager.addClient(socket, nickname);
        socket.emit('registered');
    });

    socket.on('create', function () {
        var roomId = makeId();
        var room = chatroomManager.createRoom(roomId, socket.id);
        socket.emit('created', {
            'roomId': room.id,
            'users': room.playersCurrent,
        });
        clientManager.getClientById(socket.id).room = room.id;
    });

    socket.on('voteStarted', function () {
        var client = clientManager.getClientById(socket.id);
        var room = chatroomManager.getRoomById(client.room);
        room.state = C.STATE_PAUSED;
        if (client.alreadyVoted === 0) {
            clientManager.getClientById(socket.id).alreadyVoted = 1;
            broadcastMessage(room.id, 'tick', {
                'time': room.time,
                'state': C.STATE_PAUSED,
                'info': 'Probíhá hlasování...',
            });
            socket.emit('continue');
            // if (client.role === C.SPY) {
            //     poslat info zda to uhadl nebo prohrál
            // }
        }
    });

    socket.on('print', function () {
        print();
    });

    socket.on('continue', function () {
        var client = clientManager.getClientById(socket.id);
        if (room = chatroomManager.getRoomById(client.room)) {
            room.state = C.STATE_STARTED;
            var clientsInRoom = chatroomManager.getRooms().get(room.id).clients;

            clientsInRoom.forEach(function (item, key, mapObj) {
                var client = clientManager.getClientById(key);
                if (client.alreadyVoted === 0) {
                    io.to([key]).emit('enableVoting');
                }
            });
        }

    });

    socket.on('join', function (id) {
        var room = chatroomManager.getRoomById(id);
        if (room) {
            if (room.playersCurrent >= room.playersMax) {
                socket.emit('joined', {
                    'status': C.JOIN_STATUS_FULL,
                    'count': '0'
                });
            } else {
                chatroomManager.addUser(id, socket.id);
                var count = chatroomManager.getUsersCount(id);
                broadcastMessage(id, 'joined', {
                    'status': C.JOIN_STATUS_OK,
                    'count': count,
                    'owner': room.owner,
                    'roomId': room.id,
                });
                room.playersCurrent++;
                clientManager.getClientById(socket.id).room = room.id;
            }
        } else {
            socket.emit('joined', {
                'status': C.JOIN_STATUS_NOT_EXISTS,
                'count': '0'
            });
        }
    });

    socket.on('startGame', function (gameId) {
        var room = chatroomManager.getRoomById(gameId);
        if (room.owner === socket.id) {
            room.state = C.STATE_STARTED;
            var shuffledRoles = shuffle(chatroomManager.getRolesForKey(room.location));
            var spyPosition = Math.floor(Math.random() * chatroomManager.getUsersCount(gameId));
            var clientsInRoom = chatroomManager.getRooms().get(gameId).clients;
            var index = 0;

            clientsInRoom.forEach(function (item, key, mapObj) {
                var client = clientManager.getClientById(key);
                client.role = shuffledRoles[index];
                if (index === spyPosition) {
                    client.role = C.SPY;
                }
                io.to([key]).emit('startedGame', {
                    'location': index === spyPosition ? '?' : room.location,
                    'role': client.role,
                    'time': room.time,
                });
                index++;
            });
        }
    });

    socket.on('leave', function () {
        clientManager.removeClient(socket);
    });

    socket.on('startNewGame', function () {
        var newRoomId = makeId();
        var client = clientManager.getClientById(socket.id);
        var oldRoomId = client.room;
        var clientsInRoom = chatroomManager.getRooms().get(oldRoomId).clients;
        var room = chatroomManager.createRoom(newRoomId, socket.id);
        client.room = newRoomId;
        chatroomManager.addUser(newRoomId, socket.id);
        room.owner = socket.id;
        clientsInRoom.forEach(function (item, key, mapObj) {
            var clientInRoom = clientManager.getClientById(key);
            clientInRoom.room = newRoomId;
            clientInRoom.alreadyVoted = 0;
            clientInRoom.role = null;
            chatroomManager.addUser(newRoomId, key);
        });
        var count = chatroomManager.getUsersCount(newRoomId);
        broadcastMessage(newRoomId, 'joined', {
            'status': C.JOIN_STATUS_OK,
            'count': count,
            'owner': room.owner,
            'roomId': room.id,
        });
        chatroomManager.removeRoom(oldRoomId);
    });

    socket.on('message', function () {

    });

    socket.on('disconnect', function () {
        console.log('client disconnect...', socket.id);
        if (clientManager.getClientById(socket.id)) {
            var roomId = clientManager.getClientById(socket.id).room;
            var room = chatroomManager.getRooms().get(roomId);
            if (room) {
                room.clients.forEach(function (item, key, mapObj) {
                    item.room = null;
                });
                broadcastMessage(room.id, 'somebodyLeft');
                chatroomManager.removeRoom(room.id);
            }
        }
        clientManager.removeClient(socket);
    });

    socket.on('error', function (err) {
        console.log('received error from client:', socket.id);
        console.log(err);
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

function updateRooms() {
    for (let key of chatroomManager.getRooms().keys()) {
        var room = chatroomManager.getRoomById(key);
        if (room.state === C.STATE_STARTED) {
            var output = chatroomManager.updateRoom(key);
            broadcastMessage(key, 'tick', {
                'time': output.time,
                'state': output.state,
                'info': '',
            });
        }
    }
}

setInterval(updateRooms, 1000);

function makeId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (var i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}