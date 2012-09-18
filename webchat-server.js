var io = require('socket.io').listen(80);

// usernames which are currently connected to the chat
var usernames = {};
usernames['GeneralRoom'] = "GeneralRoom";
// sockets which are currently connected to the chat
var sockets = {};

io.sockets.on('connection', function(socket) {

    // when the client emits 'newuser', this listens and executes
    socket.on('newuser', function(username, fn) {
        // store the socket linking it to a username
        sockets[username] = socket;
        // store the username in the socket session for this client
        socket.username = username;
        // store the room name in the socket session for this client
        socket.room = 'GeneralRoom';
        // add the client's username to the global list
        usernames[username] = username;
        // send client to generalroom
        socket.join(socket.room);
        // echo to generalroom that a person has connected to their room
        socket.broadcast.to(socket.room).emit('chat', 'SERVER', username + ' has connected to this room', 1);
        // update the userlist, client-side
        io.sockets.emit('setusers', usernames);
        // return the username to the client
        fn(username);         
    });

    // when the client emits 'chat', this listens and executes
    socket.on('chat', function(message) {
        // we tell the client to execute 'chat' with 2 parameters
        io.sockets.in(socket.room).emit('chat', socket.username, message, 1);
    });

    // when the client emits 'private', this listens and executes
    socket.on('private', function(from, to, message) {
        sockets[from].emit('chat', socket.username, message, 0);
        sockets[to].emit('private', socket.username, message);
    });

    /*socket.on('openChat', function(privatechat){
        socket.leave(socket.room);
        socket.join(privatechat);
        socket.emit('chat', 'SERVER', 'you have connected to '+ privatechat);
        // sent message to OLD room
        socket.broadcast.to(socket.room).emit('chat', 'SERVER', socket.username+' has left this room', 1);
        // update socket session room title
        socket.room = privatechat;
        socket.broadcast.to(privatechat).emit('chat', 'SERVER', socket.username+' has joined this room', 1);
    });*/

    // when the user disconnects, perform this
    socket.on('disconnect', function() {
        // remove the username from global username list
        delete usernames[socket.username];
        // update list of users in chat, client-side
        io.sockets.emit('setusers', usernames);
        // echo globally that this client has left
        socket.broadcast.emit('chat', 'SERVER', socket.username + ' has disconnected', 1);
        socket.leave(socket.room);
    });

});