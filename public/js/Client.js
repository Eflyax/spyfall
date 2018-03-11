$(document).ready(function () {

    var errorElement = $('#joinError');

    const STATE_NEW = 'new',
        STATE_STARTED = 'started',
        STATE_PAUSED = 'paused',
        STATE_END = 'end';
    errorElement.hide();

    var gameId = null;
    var role = '';

    var enableElement = function (selector) {

        $('.state').each(function () {
            $(this).slideUp();
        });
        $(selector).show('fast');

    };

    enableElement('#overlay');//default

    // enableElement('#startGame');
    // $('#overlay').hide();

    $('#nickNameInput').on("keydown", function (event) {
        if (event.which === 13) {
            processRegistration();
        }
    });

    $('.print').click(function () {
        socket.emit('print');
    });

    $('#welcome').on('click', '#sendNickName', function () {
        processRegistration();
    });

    function processRegistration() {
        var nickname = $('#nickNameInput').val();
        $('#nickname').text(nickname);
        socket.emit('register', nickname);
    }

    $('#startGame').on('click', '#startGameButton', function () {
        socket.emit('startGame', gameId);
    });

    $('#setup').on('click', '#create', function () {
        socket.emit('create');
    });

    $('#setup').on('click', '#joinGameButton', function () {
        enableElement('#connectGame');
    });

    $('#connectGame').on('click', '#joinToGameButton', function () {
        var gameId = $('#gameIdToJoin').val();
        socket.emit('join', gameId);
    });

    $('#gameContent').on('click', '.startVote', function () {
        socket.emit('voteStarted');
        $('.startVote').hide();
    });

    $('#gameContent').on('click', '.continue', function () {
        $('.continue').hide();
        $('.startVote').show();
        socket.emit('continue');
    });

    $('#gameContent').on('click', '.newGame', function (e) {
        if (!confirm('Opravdu?')) {
            e.preventDefault();
        } else {
            socket.emit('startNewGame');
        }
    });


    var formatTime = function (sec_num) {
        var hours = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);

        var seconds = sec_num - (hours * 3600) - (minutes * 60);
        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        return minutes + ':' + seconds;

    };

    socket.on('connect', function () {
        setTimeout(function () {
            $('#overlay').hide();
            enableElement('#welcome');
            $('#nickNameInput').focus();
        }, 1500);
    });

    socket.on('registered', function () {
        enableElement('#setup');
        $('.top-header').show();
    });

    socket.io.on('connect_error', function () {

    });

    socket.on('message', function (msg) {

    });

    socket.on('somebodyLeft', function () {
        gameId = null;
        role = null;
        enableElement('#setup');
        $('#startGameButton').show();
    });

    socket.on('continue', function (msg) {
        $('.startVote').attr("disabled", true);
        $('.startVote').hide();
        $('.continue').show();
    });

    socket.on('enableVoting', function (msg) {
        $('.startVote').removeAttr('disabled');
        $('.startVote').show();
        $('.continue').hide();
    });

    socket.on('tick', function (data) {
        $('.currentTime').text(formatTime(data.time));
        var state = '';
        switch (data.state) {
            case STATE_END:
                state = 'Hra ukončena';
                break;
            case STATE_PAUSED:
                state = data.info;
                $('.startVote').attr("disabled", true);
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

    socket.on("*", function () {
        console.log();
    });

    socket.on('joined', function (data) {
        switch (data.status) {
            case 1: // full room
                errorElement.text('Místnost je plná. Připojení se nezdařilo.');
                errorElement.show();
                break;
            case 2:// not exists
                errorElement.text('Místnost neexistuje. Připojení se nezdařilo.');
                errorElement.show();
                break;
            case 3: // success
                $('#usersCount').text(data.count);
                $('.roomId').text(data.roomId);
                $('.continue').hide();
                gameId = data.roomId;
                role = null;
                enableElement('#startGame');
                console.log(data);
                console.log(socket.id);
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
        $('.continue').hide();
        enableElement('#gameContent');
        $('.startVote').removeAttr('disabled');
        gameId = data.roomId;
        role = data.role;
    });

    socket.on('event', function (data) {

    });

});