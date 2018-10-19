var net = require('net');
var db = require('./db');
var info = require('./server_info.json');
var sockets = [];
var server_sockets;
var svr = net.createServer(function(sock) {
    console.log('Connected: ' + sock.remoteAddress + ':' + sock.remotePort);
    sockets.push(sock);



    sock.on('data', function(data) {
        for (var i = 0; i < sockets.length; i++) {
            if (sockets[i] != sock && sockets[i] != server_sockets) {
                if (sockets[i]) {
                    sockets[i].write(data);
                }
            }
        }
        if (data.toString('utf8') === 'Line_Server') {
            server_sockets = sock;
            sock.write('Welcome to the server!\n');

        } else if (server_sockets !== null) {
            data = data.toString('utf8');
            if (data.split('&')[0].length === 10) {
                server_sockets.write(data);
            } else if (data.split('&')[0] === 'location') {
                server_sockets.write(data);
            } else if (data.includes('schedule')) {
                console.log(data.split('&')[1].replace('+', ''));
                db.get_schedule(data.split('&')[1].replace('+', ''), sock);


            }

        }
        console.log('Server:' + data.toString('utf8'));
        //console.log(sockets);
    });

    sock.on('end', function() {
        console.log('Disconnected: ' + sock.remoteAddress + ':' + sock.remotePort);
        var idx = sockets.indexOf(sock);
        if (idx != -1) {
            delete sockets[idx];
        }
    });

});
var svrport = info.port;
var host = info.host;
svr.listen(svrport, host);
console.log('Server Created at ' + host + ':' + svrport + '\n');