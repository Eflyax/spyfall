module.exports = function () {
    const members = new Map();

    function broadcastMessage(message) {
        members.forEach(m => m.emit('message', message))
    }

    function addUser(client) {
        members.set(client.id, client)
    }

    function removeUser(client) {
        members.delete(client.id)
    }

    return {
        broadcastMessage,
        addUser,
        removeUser
    }
};
