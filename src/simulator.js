// includes
var net = require('net')
var simfunc = require('./lib/simulatorfunctions')
var index = require('../index')

// simulator start
var Simulator = (function () {
	var sim = this

	sim.sockets = new Map()
	sim.data = {
		SETGLOBAL: [
			{ id: 'landscape', value: 1 },
			{ id: 'screensaver', value: 1 },
		],
		SETPROFILE: [{ id: 'name', value: '' }],
		SETREGIONCOUNT: [{ id: 'count', value: 1 }],
		// Below are all regional commands
		SETLAYOUT: [
			{ id: 'analogue_clock', value: 1 },
			{ id: 'analogue_clock_local', value: 1 },
			{ id: 'digital_clock_utc', value: 0 },
			{ id: 'digital_clock_local', value: 1 },
			{ id: 'date', value: 1 },
			{ id: 'date_local', value: 1 },
			{ id: 'blank', value: '' }, // Legacy field for backwards compatibility
			{ id: 'numbers_present', value: 1 },
			{ id: 'numbers_outside', value: 1 },
		],
		SETSIZE: [
			{ id: 'rows', value: 0 },
			{ id: 'cols', value: 0 },
		],
		// Below are all tally commands
		SETROW: [
			{ id: 'rows', value: 0 },
			{ id: 'cols', value: 0 },
		],
		SETTALLY: [
			{ id: 'row', value: 0 },
			{ id: 'col', value: 0 },
			{ id: 'fg_colour', value: 'FFFFFF' },
			{ id: 'bg_colour', value: '000000' },
			{ id: 'text', value: 'Test' },
		],
		SETLABEL: [
			{ id: 'row', value: 0 },
			{ id: 'col', value: 0 },
			{ id: 'text', value: 'Test' },
		],
		SETCOUNTDOWN: [
			{ id: 'row', value: 0 },
			{ id: 'col', value: 0 },
			{ id: 'fg_colour', value: 'FFFFFF' },
			{ id: 'bg_colour', value: '000000' },
			{ id: 'target_secs', value: 0 },
			{ id: 'target_usecs', value: 0 },
			{ id: 'flash', value: 0 },
			{ id: 'label', value: 'Test' },
		],
		// Below are commands which need custom handling...
		IMAGES: {},
		// Dummy command specifications
		STOREIMAGE: [{ id: 'name' }, { id: 'image' }],
	}

	function handleConnection(socket) {
		var address = socket.remoteAddress.split('::ffff:')[1]
		console.log('Connection from: ' + address)

		// TODO(Peter): Make this a better test - connection ID or something?
		var auth = 'CRYPT:12345\r'
		socket.write(auth)
		console.log('Sent: ' + auth)

		console.log(JSON.stringify(sim.data))

		socket.data = ''
		sim.sockets.set(socket, {
			pingTimeout: setInterval(() => {
				socket.write('PING\r')
			}, 4000),
		})
		console.log('Got ' + sim.sockets.size + ' sockets')
		socket.on('end', function () {
			clearTimeout(sim.sockets.get(socket).pingTimeout)
		})
		socket.on('data', simfunc.handleSocketData)
	}

	return {
		sockets: sockets,
		data: data,
		handleConnection: handleConnection,
		sendClientMessage: simfunc.sendClientMessage,
		sendRawClientMessage: simfunc.sendRawClientMessage,
		updateData: simfunc.updateData,
		sendGlobalCommand: simfunc.sendGlobalCommand,
		updateSendGlobalData: simfunc.updateSendGlobalData,
	}
})()

module.exports = {
	Simulator,
}
