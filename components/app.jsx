import React from 'react'
import io from 'socket.io-client'
import Map from './map.jsx'
import Traveller from './traveller.jsx'

export default React.createClass({

  getInitialState() {
    return {
      travellers: [],
      visitedTravellers: [],
      traveller: null,
      mapState: {
        zoom: 0,
        location: [0,0]
      }
    }
  },

  handleSetNewTraveller() {
    let travellers = this.state.travellers
    let visited = this.state.visitedTravellers

    // Do we have travellers
    if (!travellers.length && !visited.length) {
      console.log("No travellers. Bailing.")
      return
    }

    // Have we reached the end of the queue?
    if (travellers.length == 0 && visited.length > 0) {
      console.log("End of queue. Rerun.")
      travellers = visited.slice()
      visited = []
    }

    const traveller = travellers.shift()
    visited.push(traveller)

    console.info('New traveller set 1:', traveller)

    this.setState({
      visitedTravellers: visited,
      travellers: travellers,
      currentTraveller: traveller
    })

  },

  // socket comms

  addTravellers(newTravellers) {
    const firstRun = this.state.travellers.length == 0

    let travellers = this.state.travellers.concat(newTravellers)
    travellers = travellers.sort((a,b) => {
      return b.images[0].created_time - a.images[0].created_time
    })
    this.setState({travellers: travellers})
    this.handleSetNewTraveller()

  },

  componentDidMount() {
    const socket = io()
    socket.on('connect', () => {
      console.info('Client connected')
    })

    socket.on('initialTravellers', data => {
      console.info("Got a bunch of travellers:", data)
      this.addTravellers(data.slice(1,7))
    })
  },

  handleNewMapLocation(location, zoom) {
    this.setState({
      mapState: {
        location: location,
        zoom: zoom
      }
    })
  },

  render() {
    return (
      <div>
        {
          this.state.currentTraveller &&
          <Traveller
            setNewTraveller={this.handleSetNewTraveller}
            newMapLocation={this.handleNewMapLocation}
            setNewMapLocation={this.handleNewMapLocation} traveller={this.state.currentTraveller} />
        }

        <Map location={this.state.mapState.location} zoom={this.state.mapState.zoom} />
      </div>
    )
  },

})
