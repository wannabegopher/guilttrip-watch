
import url from 'url'
import P from 'bluebird'

import TravellerKeeper from './TravellerKeeper'
import SocketPool from './SocketPool'

import geocodedAirports from './lib/geocodedAirports'
import instagram from './lib/instagram'

import debug from './debug'

class InstagramAirportPollingListener {

  constructor(config) {
    this.app = config.app
    this.ig = instagram()

    this.airportPollingFrequency = 1000*60*5

    this.airports = geocodedAirports

    this.travellerKeeper = new TravellerKeeper()
    this.socketPool = new SocketPool(config.ioSocket, this.travellerKeeper)

    this.pollAirportsAndBackfillTravellers()
  }

  pollAirportsAndBackfillTravellers() {
    let airportQueryPromises = this.airports.slice(0,30).map(airport => {
      return this.pollAirPort(airport)
    })

    P.all(airportQueryPromises).bind(this.travellerKeeper).then(this.travellerKeeper.backFillTravellers).bind(this).then(this.pollAgain)
  }

  pollAgain() {
    debug('Setup next poll')
    // Remember to GC old travellers
    setTimeout(()=>{this.pollAirportsAndBackfillTravellers()}, this.airportPollingFrequency)
  }

  pollAirPort(airport) {
    let options = {
      distance: 4000
    }

    if (airport.lastPolled) {
      options.min_timestamp = airport.lastPolled
    }

    return new P((resolve, reject) => {
      this.ig.media_search(+airport.latitude, +airport.longitude, options, (err, result, remaining, limit) => {
        if (err) {
          debug(err)
          reject()
          return
        }

        if (result.length) {
          airport.lastPolled = result[0].created_time
        }

        result.forEach(instagramImage => {
          this.travellerKeeper.registerImageInAirport(instagramImage, airport)
          debug(airport.name, new Date(+(instagramImage.created_time)*1000))
        })
        resolve()
      })
    })
  }
}


export default InstagramAirportPollingListener
