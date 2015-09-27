
import url from 'url'
import bodyParser from 'body-parser'
import instagramNode from 'instagram-node'

import airports from './lib/geocodedAirports'
import debug from './debug'

class InstagramAirportListener {

  constructor(config) {
    this.app = config.app
    this.ioSocket = config.ioSocket
    this.callbackURL = config.callbackURL

    this.initInstagram()
    this.listenToAirports()
  }

  listenToAirports() {
    airports.slice(0,5).forEach(airport => {
      debug(airport)
      this.subscribeToAirportByCoordinates(airport)
    })
    // this.subscribeToAirportByCoordinates(airport)
  }

// subscribeToAirportByLocationID(airport) {
//   this.ig.add_location_subscription(
//     3001119,
//     this.callbackURL,
//     (err, result, remaining, limit)=> {
//       if (err) {
//         debug(err)
//       }
//       debug('Result', result, 'Remaining', remaining, 'Limit',limit)
//
//   })
// }


  subscribeToAirportByCoordinates(airport) {
    console.info(airport.latitude)
    console.info(airport.longitude)
    this.ig.add_geography_subscription(
      airport.latitude,
      airport.longitude,
      900,
      this.callbackURL,
      (err, result, remaining, limit)=> {
        if (err) {
          debug(err)
        }
        debug('Result', result, 'Remaining', remaining, 'Limit',limit)

    })
  }

  initInstagram() {
    const instagramID = process.env.INSTAGRAM_ID
    const instagramSecret = process.env.INSTAGRAM_SECRET

    if (!instagramID || !instagramSecret) {
      throw("Instagram client IDs not in environment. Sry.")
    }

    this.ig = instagramNode.instagram()
    this.ig.use({client_id: instagramID, client_secret: instagramSecret})
    this.ig.del_subscription({ all: true }, (err, subscriptions, remaining, limit) => {
      if (err) {
        throw(err)
      }
    })
    this.setupInstagramRoutes()
  }


  setupInstagramRoutes() {
    const jsonParser = bodyParser.json()

    this.app.get('/instagram', (req, res, next) => {

      const parsedRequest = url.parse(req.url, true);
      if (parsedRequest['query']['hub.mode'] === 'subscribe' && (parsedRequest['query']['hub.challenge'] != null)) {
        const body = parsedRequest['query']['hub.challenge']
        const headers = {
          'Content-Length': body.length,
          'Content-Type': 'text/plain'
        }
        res.writeHead(200, headers)
        res.write(body)
        res.write(parsedRequest['query']['hub.challenge'])
      } else {
        res.writeHead(400)
      }
      return res.end()
    })

    this.app.post('/instagram', jsonParser, (req, res, next) => {
      debug(req.body)
      return res.end()
    })

  }

}

export default InstagramAirportListener
