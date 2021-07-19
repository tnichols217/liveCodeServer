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
	console.log("connection", socket.id)
	socket.on("requestDocument", (dir) => {
		console.log("got request for doc", dir)
		if (dirToSignal.hasOwnProperty(dir)) {
			socket.emit("documentAddress", dirToSignal[dir])
			console.log("sending doc", dirToSignal[dir])

		} else {
			socket.emit("documentAddress", undefined)
			console.log("cannot find doc", dir)
		}
	})

	socket.on("requestStartDocument", (dir) => {
		console.log("got request for starting a new doc", dir)
		if (!dirToSignal.hasOwnProperty(dir)) {
			socket.emit("startDocument", true)
			console.log("start doc true")
			socket.emit("requestGenerateSignal")
			console.log("requesting for signal")
			socketToDir[socket] = dir
			dirToSocket[dir] = socket
			dirToSignal[dir] = undefined
		} else {
			socket.emit("startDocument", false)
			console.log("start doc false")
		}
	})

	socket.on("generatedSignal", (serverSignal) => {
		console.log("got generated signal", serverSignal)
		dirToSignal[socketToDir[socket]] = serverSignal
	})

	socket.on("joinDocument", (data) => {
		dirToSignal[data.dir] = undefined
		console.log("got req to join document")
		dirToSocket[data.dir].emit("newClient", data.clientSignal)
		dirToSocket[data.dir].emit("requestGenerateSignal")
	})

	socket.on("disconnect", () => {
		console.log("disconnected", socket.id)
		delete dirToSocket[socketToDir[socket]]
		delete dirToSignal[socketToDir[socket]]
		delete socketToDir[socket]
	})
});