
import url from 'url'
import request from 'request'
import bodyParser from 'body-parser'
import instagramNode from 'instagram-node'
import P from 'bluebird'
import geocodedAirports from './lib/geocodedAirports'
import debug from './debug'

import haversine from 'haversine-distance'


class InstagramAirportPollingListener {


  constructor(config) {
    this.app = config.app
    this.ioSocket = config.ioSocket
    this.airportPollingFrequency = 1000*60*2

    this.airports = geocodedAirports
    this.travellers = {}

    this.initInstagram()
    this.pollAirportsAndBackfillTravellers()
  }


  pollAirportsAndBackfillTravellers() {
    let airportQueryPromises = this.airports.slice(0,1).map(airport => {
      return this.pollAirPort(airport)
    })

    P.all(airportQueryPromises).bind(this).then(this.backFillUsers).then(this.pollAgain)
  }


  pollAgain() {
    debug('Setup next poll')
    // Remember to GC old travellers
    setTimeout(()=>{this.pollAirportsAndBackfillTravellers()}, this.airportPollingFrequency)
  }


  backFillUsers() {
    const travellerList = Object.keys(this.travellers).map(key => this.travellers[key])
    const travellersToBackfill = travellerList.filter(traveller => {
      return traveller.images.length == 0
    })

    debug(`Got ${travellersToBackfill.length} new travellers. Backfilling`)

    return new P(resolve => {
      const backfillPromises = travellersToBackfill.map(traveller => {return this.backFillUser(traveller)})
      P.all(backfillPromises).then(resolve)
    })
  }


  // Todo: backfill more for very frequent travellers

  backFillUser(traveller) {

    return new P((resolve, reject)=> {

      this.ig.user_media_recent(traveller.id, (err, result, remaining, limit) => {
        if (err) {
          debug(err)
        }

        traveller.images = traveller.images.concat(result)

        result.forEach((previousImage, index) => {
          if (previousImage.location) {
            const destCoordinate = this.formattedCoordinates(previousImage)
            const distance = haversine(traveller.location, destCoordinate) / 1000
            debug("name:", traveller.fullName, new Date(+(previousImage.created_time)*1000), Math.floor(distance), 'km', previousImage.link)
          }
        })
        resolve()
      })
    })
  }




  pollAirPort(airport) {
    return new P((resolve, reject) => {

      let options = {
        distance: 5000
      }

      if (airport.lastPolled) {
        options.min_timestamp = airport.lastPolled
      }

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
          this.registerTraveller(instagramImage, airport)
          debug(airport.name, new Date(+(instagramImage.created_time)*1000))
        })
        resolve()
      })
    })
  }


  registerTraveller(instagramImage, airport) {

    const user = instagramImage.user
    const userId = user.id

    if (this.travellers[userId]) {
      return
    }

    const traveller = {
      isInteresting: null,
      username: user.username,
      airport: airport,
      profilePicture: user.profile_picture,
      id: user.id,
      fullName: user.full_name,
      hitImage: instagramImage,
      location: this.formattedCoordinates(instagramImage),
      images: []
    }
    this.travellers[userId] = traveller
  }

  formattedCoordinates(instagramImage) {
    return {
      latitude: instagramImage.location.latitude,
      longitude: instagramImage.location.longitude
    }
  }

  initInstagram() {
    const instagramID = process.env.INSTAGRAM_ID
    const instagramSecret = process.env.INSTAGRAM_SECRET
    if (!instagramID || !instagramSecret) {
      throw('Instagram client IDs not in environment. Sry.')
    }
    this.ig = instagramNode.instagram()
    this.ig.use({client_id: instagramID, client_secret: instagramSecret})
  }

}


export default InstagramAirportPollingListener
