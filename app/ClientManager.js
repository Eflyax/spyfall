module.exports = function () {
    const clients = new Map();

    function addClient(socket, nickname) {
        clients.set(socket.id,
            {
                'nick': nickname,
                'room': null,
                'alreadyVoted': 0,
                'role': null,
            });
    }

    function removeClient(client) {
        clients.delete(client.id)
    }

    function getClientById(id) {
        return clients.get(id);
    }

    function getClients() {
        return clients;
    }

    return {
        addClient,
        removeClient,
        getClientById,
        getClients
    }
};
