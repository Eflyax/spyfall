$(document).ready(function () {
    var errorElement = $('#joinError');

    const STATE_NEW = 'new',
        STATE_STARTED = 'started',
        STATE_PAUSED = 'paused',
        STATE_END = 'end';

    errorElement.hide();
    var socket = io('http://127.0.0.1:3000', {});
    var gameId = null;
    var role = '';

    $('#welcome').on('click', '#sendNickName', function () {
        var nickname = $('#nickNameInput').val();
        console.log('posílám nick: ' + nickname);
        socket.emit('register', nickname);
        console.log('odesláno');
    });

    $('#app').on('click', '.print', function () {
        console.log('print');
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

    var formatTime = function (time) {

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

    socket.on('tick', function (data) {
        $('.currentTime').text(data.time);
        var state = '';
        switch (data.state) {
            case STATE_END:
                state = 'Hra ukončena';
                break;
            case STATE_PAUSED:
                state = 'Hra pozastavena';
                break;
            case STATE_NEW:
                state = 'Hra nezapočala';
                break;
            case STATE_STARTED:
                state = '';
                break;
            default:
                state = 'Nerozpoznaný herní stav';
                break;
        }
        $('.gameState').text(state);
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
                $('.roomId').text(data.roomId);
                enableElement('#startGame');
                var startButton = $('#startGameButton');
                data.owner === socket.id
                    ? startButton.show()
                    : startButton.hide();
                break;
        }
    });

    socket.on('created', function (data) {
        $('.roomId').text(data.roomId);
        $('#usersCount').text(data.users);
        enableElement('#startGame');
        gameId = data.roomId;
    });

    socket.on('startedGame', function (data) {
        $('.roomId').text(data.roomId);
        $('#location').text(data.location);
        $('#role').text(data.role);
        enableElement('#gameContent');
        gameId = data.roomId;
        role = data.role;
        $('.startVote').text('Zahájit hlasování');
    });

    socket.on('event', function (data) {

    });

});