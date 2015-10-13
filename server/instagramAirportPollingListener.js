
import url from 'url'
import P from 'bluebird'
import geocodedAirports from './lib/geocodedAirports'
import instagram from './lib/instagram'
import TravellerKeeper from './TravellerKeeper'
import debug from './debug'

class InstagramAirportPollingListener {

  constructor(config) {
    this.app = config.app
    this.ioSocket = config.ioSocket
    this.airportPollingFrequency = 1000*60*2

    this.airports = geocodedAirports
    this.travellerKeeper = new TravellerKeeper()

    this.ig = instagram()

    this.pollAirportsAndBackfillTravellers()
  }

  pollAirportsAndBackfillTravellers() {
    let airportQueryPromises = this.airports.map(airport => {
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
      distance: 5000
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
