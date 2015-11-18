
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
    console.info("Connection!")
    socket.emit('initialTravellers', this.travellerKeeper.interestingTravellerList().slice(0,10))
  }

  updateClients() {
    this.ioSocket.emit('initialTravellers', this.travellerKeeper.travellerList())
  }

}

export default SocketPool
