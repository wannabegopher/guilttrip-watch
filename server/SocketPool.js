
import debug from './debug'

class SocketPool {

  constructor(ioSocket, travellerKeeper) {
    this.ioSocket = ioSocket
    this.travellerKeeper = travellerKeeper
    console.info(this.travellerKeeper)
    debugger

    ioSocket.on('connection', this.handleClientConnected.bind(this))
  }

  handleClientConnected(socket) {
    socket.emit('initialTravellerSet', this.travellerKeeper.travellerList())
  }

  updateClients() {
    this.ioSocket.emit('initialTravellerSet', this.travellerKeeper.travellerList())
  }

  // function emitRandom() {
  //   ioSocket.emit('ping', {ping: Math.random()})
  //   setTimeout(emitRandom, 1000)
  // }

}

export default SocketPool
