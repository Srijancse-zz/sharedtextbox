//All the required pre-requistic libraries, and enabling them
var http = require('http');
var express = require('express');
var ShareDB = require('sharedb');
var WebSocket = require('ws');
var WebSocketJSONStream = require('websocket-json-stream');

// Creating a new ShareDB instance
var backend = new ShareDB();
//Starting the server
createDoc(startServer);

// Create initial document then fire callback
function createDoc(callback) {
    var connection = backend.connect();
    var doc = connection.get('sharedtextbox', 'textarea');
    doc.fetch(function (err) {
        if (err) throw err;
        if (doc.type === null) {
            doc.create('', callback);
            return;
        }
        callback();
    });
}

//Function to start the server
function startServer() {
    // Create a web server to serve files and listen to WebSocket connections
    var app = express();
    app.use(express.static('static'));
    var server = http.createServer(app);

    // Connect any incoming WebSocket connection to ShareDB
    var wss = new WebSocket.Server({
        server: server
    });
    wss.on('connection', function (ws, req) {
        var stream = new WebSocketJSONStream(ws);
        backend.listen(stream);
    });

    server.listen(8080);
    console.log('Listening on http://localhost:8080');
}