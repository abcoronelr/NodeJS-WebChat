
var connected = false;      
var scroll = 0;
var from = '';
var to = 'GeneralRoom'
var socket = io.connect('http://localhost:8080');

// on load of page
$(function(){
    // when the client clicks SEND
    $('#datasend').click( function() {
        var message = $('#message').val();
        $('#message').val('');
        // tell server to execute 'chat' and send along one parameter
        if (to == 'GeneralRoom') socket.emit('chat', message);
        else socket.emit('private', from, to, message);
    });

    // when the client hits ENTER on their keyboard
    $('#message').keypress(function(e) {
        if(e.which == 13) {
            $(this).blur();
            $('#datasend').focus().click();
            $('#message').focus();
        }
    });

    $('#message').focus();
});

socket.on('connect', function() {
    connected = true;
    socket.emit('newuser', prompt('nick?'), function(nick) {
        from = nick;
    });
});

socket.on('chat', function(username, message, general) {
    var chat = "";
    // verify if the message is going to GeneralRoom or specific user
    if (general) chat = '#GeneralRoom';
    else chat = '#chat-' + to;

    // verify if GeneralRoom is active, if not, add 'pending' class
    if (chat == '#GeneralRoom') {
        if ($(chat).hasClass('hidden')) $('#list-GeneralRoom').addClass('pending');
    }

    // add the message to the chat window
    $(document.createElement('div')).
        text(username + ': ' + message).
        appendTo(chat);
        scroll += 50;
        $(chat).scrollTop(scroll);
});

socket.on('private', function(username, message) {
    // verify if the chat div exists for the user that is trying to contact us
    if ($('#chat-' + username).length <= 0) {
        // create the chat div
        $('#chat').append('<div id="chat-' + username + '" class="chat hidden"></div>');
    }

    // verify if the chat div is active, if not, add 'pending' class
    if ($('#chat-' + username).hasClass('hidden')) $('#list-' + username).addClass('pending');

    // add the message to the chat div
    $(document.createElement('div')).
        text(username + ': ' + message).
        appendTo('#chat-' + username);
        scroll += 50;
        $('#chat-' + username).scrollTop(scroll);
});

// listener, whenever the server emits 'updaterooms', this updates the room the client is in
socket.on('setusers', function(username) {
    $('#users').empty();
    $.each(username, function(key, value) {
        $('#users').append('<div id="list-' + value +'"><a href="#" onclick="openChat(\''+value+'\')">' + value + '</a></div>');
    });
});

var openChat = function(chat){
        to = chat;
        // remove 'selected' class to all userlist elements
        $('div.selected').removeClass('selected');
        // if exists, remove 'pending' class to the userlist element
        $('#list-' + chat).removeClass('pending');
        // add class selected to the active userlist element
        $('#list-' + chat).addClass('selected');
        
        // add class hidden to all window divs
        $('div.chat').addClass('hidden');

        $('#message').focus();

        // verify if the active window div is GeneralRooms, then add class hidden to it
        if (chat == 'GeneralRoom') { $('#GeneralRoom').removeClass('hidden'); return; }

         // verify if the chat div exists for the user that is trying to contact us
         // if exists, remove 'hidden' class, if not, add a new window div
        if ($('#chat-' + chat).length) $('#chat-' + chat).removeClass('hidden');
        else $('#chat').append('<div id="chat-' + chat + '" class="chat"></div>');
}

