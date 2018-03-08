$(document).ready(function () {
    var socket = io('http://127.0.0.1:3000', {});

    $('#welcome').on('click', '#sendNickName', function () {
        var nickname = $('#nickNameInput').val();
        console.log('posílám nick: ' + nickname);
        socket.emit('register', nickname);
        console.log('odesláno');
    });

    $('#app').on('click', '.print', function () {
        console.log('print ');
        socket.send('print');
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
        console.log('you are registred');
    });

    socket.io.on('connect_error', function () {

    });

    socket.on('message', function (msg) {

    });

    socket.on('event', function (data) {

    });

});