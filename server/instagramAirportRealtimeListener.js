
import url from 'url'
import request from 'request'
import bodyParser from 'body-parser'
import instagramNode from 'instagram-node'
import P from 'bluebird'
import airports from './lib/geocodedAirports'
import debug from './debug'

// object_id <-- this
// https://api.instagram.com/v1/geographies/12995617/media/recent?client_id=67ea0a8b81584a05aeb62239ba92f7a1

class InstagramAirportListener {

  constructor(config) {
    this.app = config.app
    this.ioSocket = config.ioSocket
    this.callbackURL = 'http://93fb796a.ngrok.io/instagram'

    this.setupInstagramRoutes()
    this.initInstagram().then(this.listenToAirports())
  }

  listenToAirports() {
    airports.slice(0,5).forEach(airport => {
      this.subscribeToAirportByCoordinates(airport)
    })
  }

  subscribeToAirportByCoordinates(airport) {

    debug("Using callback URL", this.callbackURL)

    this.ig.add_geography_subscription(
      +airport.latitude,
      +airport.longitude,
      5000,
      this.callbackURL,

      (err, result, remaining, limit) => {
        if (err) {
          debug(err)
        }

        debug('Reply from subscribe', 'Result', result, 'Remaining', remaining, 'Limit',limit)

        this.ig.subscriptions((err, result, remaining, limit)=> {
          debug('Confirmed subscriptions:','Result', result, 'Remaining', remaining, 'Limit',limit)
        })

    })
  }

  initInstagram() {
    const instagramID = process.env.INSTAGRAM_ID
    const instagramSecret = process.env.INSTAGRAM_SECRET

    if (!instagramID || !instagramSecret) {
      throw('Instagram client IDs not in environment. Rly sry.')
    }

    this.ig = instagramNode.instagram()
    this.ig.use({client_id: instagramID, client_secret: instagramSecret})

    return new P((resolve, reject)=> {
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
