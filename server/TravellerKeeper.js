
import P from 'bluebird'
import Traveller from './Traveller'
import debug from './debug'

export default class TravellerKeeper {

  constructor(config) {
    this.travellers = {}
  }

  registerImageInAirport(image, airport) {
    const user = image.user
    const userId = user.id

    const traveller = this.travellers[userId]

    if (traveller) {
      traveller.addSingleImage(image)
    } else {
      this.travellers[userId] = new Traveller(image, airport)
    }
  }

  travellerList() {
    return Object.keys(this.travellers).map(key => this.travellers[key])
  }

  travellersWithoutImages() {
    return this.travellerList().filter(traveller => {
      return traveller.images.length == 0
    })
  }

  backFillTravellers() {
    const travellersToBackfill = this.travellersWithoutImages()

    debug(`Found ${travellersToBackfill.length} new travellers. Backfilling.`)

    return new P(resolve => {
      const backfillPromises = travellersToBackfill.map(traveller => {return traveller.backFill()})
      P.all(backfillPromises).then(resolve)
    })
  }

}
