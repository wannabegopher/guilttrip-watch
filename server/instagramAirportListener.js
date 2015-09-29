
import url from 'url'
import request from 'request'
import bodyParser from 'body-parser'
import instagramNode from 'instagram-node'
import P from 'bluebird'
import airports from './lib/geocodedAirports'
import debug from './debug'


class InstagramAirportListener {

  constructor(config) {
    this.app = config.app
    this.ioSocket = config.ioSocket
    this.callbackURL = config.callbackURL

    this.setupInstagramRoutes()
    this.initInstagram().then(this.listenToAirports())
  }

subscribeToAirportByLocationID(airport) {
  this.ig.add_location_subscription(
    3001373,
    this.callbackURL,
    (err, result, remaining, limit)=> {
      if (err) {
        debug(err)
      }
      debug('Result', result, 'Remaining', remaining, 'Limit',limit)

  })
}

  listenToAirports() {
    this.subscribeToAirportByCoordinates(airports[0])
    this.subscribeToAirportByLocationID()
    // airports.forEach(airport => {
    //   this.subscribeToAirportByCoordinates(airport)
    // })
  }

  subscribeToAirportByCoordinates(airport) {

    debug("Using callback URL", this.callbackURL)

    this.ig.add_geography_subscription(
      40.758876, -73.985136,
      // airport.latitude,
      // airport.longitude,
      4900,
      this.callbackURL,

      (err, result, remaining, limit) => {
        if (err) {
          debug(err)
        }
        debug('Reply from subscribe', 'Result', result, 'Remaining', remaining, 'Limit',limit)

        // this.ig.subscriptions((err, result, remaining, limit)=> {
        //   debug('Confirmed subscription:','Result', result, 'Remaining', remaining, 'Limit',limit)
        // })

    })
  }

  initInstagram() {
    const instagramID = process.env.INSTAGRAM_ID
    const instagramSecret = process.env.INSTAGRAM_SECRET

    if (!instagramID || !instagramSecret) {
      throw('Instagram client IDs not in environment. Sry.')
    }

    this.ig = instagramNode.instagram()
    this.ig.use({client_id: instagramID, client_secret: instagramSecret})

    return new P((resolve, reject)=> {
      resolve()
      return

      this.ig.del_subscription({ all: true }, (err, subscriptions, remaining, limit) => {
        debug('Subscriptions deleted')
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })

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
        debug('Successfully replied to instagram challenge')
      } else {
        res.writeHead(400)
      }
      return res.end()
    })

    this.app.post('/instagram', jsonParser, (req, res, next) => {
      debug(req.body, req.body.data)
      return res.end()
    })

  }

}

export default InstagramAirportListener
