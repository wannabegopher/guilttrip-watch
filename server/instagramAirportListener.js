
import instagramNode from 'instagram-node'
import airports from './lib/geocodedAirports'

import debug from './debug'


class InstagramAirportListener {
  URL = "http://guilttrip.watch/instagram"

  constructor(config) {
    this.app = config.app
    this.ioSocket = config.ioSocket
  }

  initInstagram() {
    this.ig = instagramNode.instagram()
    ig.use({client_id: process.env.INSTAGRAM_ID})
    ig.use({client_secret: process.env.INSTAGRAM_SECRET})
    ig.del_subscription({ all: true }, (err, subscriptions, remaining, limit) => {
      if (err) {
        throw(err)
      }
    })
    this.setupInstagramRoutes()
  }

  setupInstagramRoutes() {
    this.app.get('/instagram', function home (req, res, next) {
    })

    this.app.post('/instagram', function home (req, res, next) {
    })

  }

}

export default InstagramAirportListener
