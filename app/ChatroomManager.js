const C = require('./constants');

module.exports = function () {
    // mapping of all available chatrooms
    const chatrooms = new Map();

    function getRolesForKey(key) {
        return C.CARD[key];
    }

    function createRoom(idRoom, socketId) {

        var location = pickRandomLocation();
        chatrooms.set(idRoom, {
            'id': idRoom,
            'owner': socketId,
            'time': C.SECONDS_TO_END,
            'location': location,
            'playersMax': C.MAX_PLAYERS,
            'playersCurrent': 1,
            'clients': new Map(),
            'state': C.STATE_NEW
        });
        addUser(idRoom, socketId);

        return chatrooms.get(idRoom);
    }

    function removeRoom(roomId) {
        chatrooms.delete(roomId)
    }

    function pickRandomRole(location) {
        var randomIndex = Math.floor(Math.random() * C.CARD[location].length);

        return C.CARD[location][randomIndex];
    }

    function getUsersCount(id) {
        return getRoomById(id).clients.size;
    }

    function getRooms() {
        return chatrooms;
    }

    function getRoomById(id) {
        return chatrooms.get(id);
    }

    function updateRoom(id) {
        var room = getRoomById(id);

        if (room.state === C.STATE_STARTED) {
            if (room.time <= 0) {
                room.state = C.STATE_END;
            } else {
                room.time--;
            }
        }

        return {'time': room.time, 'state': room.state};
    }

    function pickRandomLocation() {
        var result;
        var count = 0;
        for (var prop in C.CARD) {
            if (Math.random() < 1 / ++count) {
                result = prop;
            }
        }
        return result;
    }

    function addUser(roomId, clientId) {
        var room = chatrooms.get(roomId);
        room.clients.set(clientId, clientId);
    }

    function removeUser(roomId, client) {
        chatrooms.get(roomId).clients.delete(client.id);
    }

    return {
        getRolesForKey,
        getUsersCount,
        addUser,
        removeUser,
        createRoom,
        getRooms,
        updateRoom,
        removeRoom,
        getRoomById
    }
};
