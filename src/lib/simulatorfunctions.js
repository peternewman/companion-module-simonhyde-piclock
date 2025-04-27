var indexfile = require('../../index')

function handleSocketData(data) {
	console.log('Got data: ' + data.toString())

	//this.data += data.toString()
	var blocks = this.data.split('\n\n')

	// TODO(Peter): I think the below is redundant? It's certainly not being called currently...
	// process blocks
	if (indexfile.serverIsActive == true) {
		while (blocks.length > 1) {
			var block = blocks.splice(0, 1)
			var lines = block[0].split('\n')
			if (lines[0] == '')
				// remove initial blank line
				lines.splice(0, 1)
			if (lines[0] == 'PING:') {
				this.write('ACK\n\n')
			} else {
				// the block header given is unimplemented or non-standard
			}
		}
		this.data = blocks[0]
	}
}

function sendRawClientMessage(self, message) {
	// send it to all the clients
	console.log('Sending: ' + message)
	//console.log(JSON.stringify(self))
	//console.log(JSON.stringify(self.sim.Simulator))
	console.log('Got ' + self.sim.Simulator.sockets.size + ' sockets')
	for (const s of self.sim.Simulator.sockets.keys()) {
		console.log(JSON.stringify(s))
		console.log('Sent to :' + s)
		s.write(message + '\r')
	}
	console.log('Done sending')
}

function updateData(self, command, update) {
	self.log('debug', 'Pre Data: ' + JSON.stringify(self.sim.Simulator.data))
	self.log('debug', 'Command: ' + JSON.stringify(command))
	self.log('debug', 'Update Data: ' + JSON.stringify(update))
	if (command === 'STOREIMAGE') {
		self.log('debug', 'Pre Images: ' + JSON.stringify(self.sim.Simulator.data.IMAGES))
		self.sim.Simulator.data['IMAGES'][update['name']] = update['image']
		self.log('debug', 'Post Images: ' + JSON.stringify(self.sim.Simulator.data.IMAGES))
	} else if (command === 'CLEARIMAGES') {
		// Truncate the array...
		self.sim.Simulator.data['IMAGES'] = {}
		self.log('debug', 'Post Images: ' + JSON.stringify(self.sim.Simulator.data.IMAGES))
	} else {
		for (const opt of Object.keys(update)) {
			self.log('debug', 'Checking option:' + opt + ' (' + update[opt] + ')')
			for (var prop of self.sim.Simulator.data[command]) {
				self.log('debug', 'Looking at: ' + JSON.stringify(prop))
				self.log('debug', 'Looking at: ' + prop['id'] + ' = ' + prop['value'])
				if (opt === prop['id']) {
					prop['value'] = update[opt]
					self.log('debug', 'New: ' + prop['id'] + ' = ' + prop['value'])
					break // We've updated, stop searching
				}
			}
		}
		self.log('debug', 'Post data: ' + JSON.stringify(self.sim.Simulator.data))
		//await self.sim.Simulator.sendRawClientMessage(self, action.options['cmd'])
	}
}

function sendGlobalCommand(self, command, update) {
	self.log('debug', 'Sending: ' + command)
	self.log('debug', 'Data: ' + JSON.stringify(self.sim.Simulator.data))
	var message = command
	if (command === 'STOREIMAGE') {
		message +=
			':' +
			self.sim.Simulator.data[command]
				.map((opt) => {
					return update[opt['id']]
				})
				.join(':')
	} else if (command === 'CLEARIMAGES') {
		// No arguments needed for CLEARIMAGES...
	} else {
		message +=
			':' +
			self.sim.Simulator.data[command]
				.map((opt) => {
					return opt['value']
				})
				.join(':')
	}
	self.log('debug', 'Msg: ' + message)
	sendRawClientMessage(self, message)
}

function updateSendGlobalData(self, command, update) {
	updateData(self, command, update)
	sendGlobalCommand(self, command, update)
}

module.exports = {
	handleSocketData,
	sendRawClientMessage,
	updateData,
	sendGlobalCommand,
	updateSendGlobalData,
}
