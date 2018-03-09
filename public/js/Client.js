$(document).ready(function () {
    var errorElement = $('#joinError');
    errorElement.hide();
    var socket = io('http://127.0.0.1:3000', {});

    var gameId = null;

    $('#welcome').on('click', '#sendNickName', function () {
        var nickname = $('#nickNameInput').val();
        console.log('posílám nick: ' + nickname);
        socket.emit('register', nickname);
        console.log('odesláno');
    });

    $('#app').on('click', '.print', function () {
        console.log('print ');
        // socket.send('print');
    });

    $('#startGame').on('click', '#startGameButton', function () {
        socket.emit('startGame', gameId);
    });

    $('#setup').on('click', '#create', function () {
        console.log('odesílám žádost o vytvoření');
        socket.emit('create');
    });

    $('#setup').on('click', '#joinGameButton', function () {
        enableElement('#connectGame');
    });

    $('#connectGame').on('click', '#joinToGameButton', function () {
        var gameId = $('#gameIdToJoin').val();
        socket.emit('join', gameId);
    });

    var enableElement = function (selector) {
        $('.state').each(function () {
            $(this).removeClass('enabled');
            $(this).addClass('disabled');
        });
        $(selector).addClass('enabled');
    };

    socket.on('connect', function () {
        enableElement('#welcome');
    });

    socket.on('registered', function () {
        enableElement('#setup');
        console.log('you are registered');
    });

    socket.io.on('connect_error', function () {

    });

    socket.on('message', function (msg) {

    });

    socket.on('joined', function (data) {
        console.log(data);
        switch (data.status) {
            case'1': // full room
                errorElement.text('Místnost je plná. Připojení se nezdařilo.');
                errorElement.show();
                break;
            case'2':// not exists
                errorElement.text('Místnost neexistuje. Připojení se nezdařilo.');
                errorElement.show();
                break;
            case'3': // success
                $('#usersCount').text(data.count);
                enableElement('#startGame');
                var startButton = $('startGameButton');
                data.owner === socket.id
                    ? startButton.show()
                    : startButton.hide();
                break;
        }
    });

    socket.on('created', function (data) {
        $('#roomId').text(data.roomId);
        $('#usersCount').text(data.users);
        enableElement('#startGame');
        gameId = data.roomId;
    });

    socket.on('startedGame', function (data) {

        console.log('hra tačaka');
        console.log(data);

        $('#roomId').text(data.roomId);
        $('#location').text(data.location);
        $('#role').text(data.role);
        enableElement('#gameContent');
        gameId = data.roomId;
    });

    socket.on('event', function (data) {

    });

});