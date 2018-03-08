module.exports = function () {
    const clients = new Map();

    function addClient(socket, nickname) {
        clients.set(socket.id, {nickname})
    }

    function removeClient(client) {
        clients.delete(client.id)
    }

    function getUserByClientId(clientId) {
        return (clients.get(clientId) || {}).user
    }

    function getClients() {
        return clients;
    }

    return {
        addClient,
        removeClient,
        getUserByClientId
    }
};
