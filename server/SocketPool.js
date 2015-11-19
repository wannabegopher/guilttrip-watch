
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

    let travellers = this.travellerKeeper.interestingTravellerList()

    travellers.sort((a,b) => {
      return b.images[0].created_time - a.images[0].created_time
    })

    socket.emit('initialTravellers', travellers.slice(0,10))
  }

  updateClients() {
    this.ioSocket.emit('initialTravellers', this.travellerKeeper.travellerList())
  }

}

export default SocketPool
