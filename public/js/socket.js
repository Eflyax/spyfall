var socket = io('http://127.0.0.1:3000', {});

var Client = (function (socket) {

    function Client(socket) {
        this.socket = socket;
    }

    Client.prototype.getModel = function () {
        return this.model;
    };

    this.socket.on('connect', function () {
        
    });

    this.socket.io.on('connect_error', function () {

    });

    this.socket.on('message', function (msg) {

    });

    this.socket.on('event', function (data) {

    });

    return Client;

}());
