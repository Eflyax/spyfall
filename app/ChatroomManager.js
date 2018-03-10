const C = require('./constants');

module.exports = function () {
    // mapping of all available chatrooms
    const chatrooms = new Map();

    var cards = {
        'Hotel': ['Recepční', 'Barman', 'Pokojská', 'Ředitel hotelu', 'Pikolík', 'Host', 'Ochranka'],
        'Letadlo': ['Pilot', 'Druhý pilot', 'Pasažér v ekonomické třídě', 'Letecký mechanik', 'Pasažér v byzbys třídě', 'Letuška', 'Černý pasažér'],
    };

    function getRolesForKey(key) {
        return cards[key];
    }

    function createRoom(idRoom, socket) {

        var location = pickRandomLocation();
        chatrooms.set(idRoom, {
            'id': idRoom,
            'owner': socket.id,
            'time': C.SECONDS_TO_END,
            'location': location,
            'playersMax': C.MAX_PLAYERS,
            'playersCurrent': 1,
            'clients': new Map(),
            'state': C.STATE_NEW
        });
        addUser(idRoom, socket);

        return chatrooms.get(idRoom);
    }

    function pickRandomRole(location) {
        var randomIndex = Math.floor(Math.random() * cards[location].length);

        return cards[location][randomIndex];
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
        for (var prop in cards) {
            if (Math.random() < 1 / ++count) {
                result = prop;
            }
        }
        return result;
    }

    function addUser(roomId, client) {
        var room = chatrooms.get(roomId);
        room.clients.set(client.id, client);
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
        getRoomById
    }
};
