var express = require('express')
var socket = require('socket.io')
var peerjs = require('peerjs-server')

/*App setup*/
var app = express();
var server = app.listen(4000);

/*Socket*/
var io = socket(server)

/*Vars*/
var socketToDir = {}
var dirToSocket = {}
var dirToSignal = {}

/*IO*/
io.on('connection', (socket) => {
	socket.on("requestDocument", (dir) => {
		if (addrs.hasOwnProperty(dir)) {
			socket.emit("documentAddress", dirToSignal[dir])

		} else {
			socket.emit("documentAddress", undefined)
		}
	})

	socket.on("requestStartDocument", (dir) => {
		if (!addrs.hasOwnProperty(dir)) {
			socket.emit("startDocument", true)
			socket.emit("requestGenerateSignal")
			socketToDIr[socket] = dir
			dirToSocket[dir] = socket
		} else {
			socket.emit("startDocument", false)
		}
	})

	socket.on("generatedSignal", (serverSignal) => {
		dirToSignal[socketToDir[socket]] = serverSignal
	})

	socket.on("joinDocument", (data) => {
		 dirToSocket[data.dir].emit("newClient", data.clientSignal)
	})
});