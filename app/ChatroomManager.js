module.exports = function () {
    // mapping of all available chatrooms
    const chatrooms = new Map();

    var cards = {
        'Hotel': ['Recepční', 'Barman', 'Pokojská', 'Ředitel hotelu', 'Pikolík', 'Host', 'Ochranka'],
        'Letadlo': ['Pilot', 'Druhý pilot', 'Pasažér v ekonomické třídě', 'Letecký mechanik', 'Pasažér v byzbys třídě', 'Letuška', 'Černý pasažér'],
    };

    function createRoom(idRoom, socket) {
        var secondsToEnd = 480;
        var maxPlayers = 8;
        var location = pickRandomLocation();
        chatrooms.set(idRoom, {
            'id': idRoom,
            'owner': socket.id,
            'time': secondsToEnd,
            'location': location,
            'role': pickRandomRole(location),
            'playersMax': maxPlayers,
            'playersCurrent': 1,
            'clients': new Map(),
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
        getUsersCount,
        addUser,
        removeUser,
        createRoom,
        getRooms,
        getRoomById,
    }
};
