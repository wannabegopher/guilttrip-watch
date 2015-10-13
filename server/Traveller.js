
import haversine from 'haversine-distance'
import haversineFormatInstagramCoords from './lib/haversineFormatInstagramCoords'
import instagram from './lib/instagram'
import debug from './debug'
import P from 'bluebird'
import moment from 'moment'

export default class Traveller {

  constructor(image, airport) {

    const {user} = image
    this.isInteresting = null

    this.id = user.id,
    this.username = user.username
    this.fullName = user.full_name
    this.firstSpottedAt = airport
    this.profilePicture = user.profile_picture,
    this.images = []

    this.ig = instagram()
  }

  addMultipleImages(images) {
    images.forEach(image => this.addSingleImage(image))
    // debug(`Added ${images.length} images to ${this.username}`)
  }

  addSingleImage(image) {
    if (this.imageIsNew(instagram)) {
      this.images.push(image)
    }
  }

  imageIsNew(image) {
    const id = {image}
    const matchedImages = this.images.filter(image => id == image.id)
    return matchedImages.length == 0
  }

  sortImages() {
    this.images = this.images.sort((a,b)=> {
      return b.created_time - a.created_time
    })
  }

  calculateDistanceInKm(image1, image2) {
    if (!image1.location || !image2.location ) { return 0 }
    return haversine(haversineFormatInstagramCoords(image1), haversineFormatInstagramCoords(image2)) / 1000
  }

  validImage(image) {
    if (!image.location) {
      return false
    }

    // Check tags: #tbt, #latergram, #latagram, …

    return true
  }

  update() {
    this.sortImages()
    this.totalTravelled = 0

    debug(`\n- ${this.username} -`)


    let image1, image2

    for (let i = 0; i < this.images.length - 1; i++) {

      const currentImage = this.images[i]

      // Find start of chain. Skip until we have one.
      if (!image1) {
        if (this.validImage(currentImage)) {
          image1 = currentImage
        }
        continue
      }

      // If we have a source, find the destination or try next
      if (this.validImage(currentImage)) {
        image2 = currentImage
      } else {
        continue
      }

      const km = this.calculateDistanceInKm(image1, image2)


      const date1 = Traveller.dateFromImage(image1)
      const date2 = Traveller.dateFromImage(image2)

      const diffHours = (date1.getTime() - date2.getTime()) / 1000 / 60 / 60
      const kmPerHour = km/diffHours

      if (kmPerHour > 1000) {
        // Ok, as long as they are not quickly instagramming fighter pilots
        continue
      }

      const relativeTime = moment(date1).toNow(true)
      const relativeTimeBetween = moment(date1).to(date2, true)

      // Filter by > 500km/h


      if (km > 1) {
        debug(` -- ${i} ${relativeTime} ago | ${Math.floor(km)}km in ${relativeTimeBetween} (${Math.floor(kmPerHour)}km/h) | ${image2.location.name} -> ${image1.location.name}`)
      }

      this.totalTravelled += km
      image1 = image2

    }

    debug(`\n  grand total: ${this.totalTravelled}km \n`)

  }

  static dateFromImage(image) {
    return new Date(image.created_time*1000)
  }

  backFill() {
    return new P((resolve, reject)=> {
      this.ig.user_media_recent(this.id, (err, result, remaining, limit) => {
        if (err) {
          debug(err)
        }

        if (result.lenght == 0) { return }

        this.addMultipleImages(result)
        this.update()
        resolve()

      })
    })
  }

}
