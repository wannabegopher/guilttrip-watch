
import totalDistance from './lib/totalDistance'
import instagram from './lib/instagram'
import debug from './debug'
import P from 'bluebird'
import validImage from './lib/validImage'

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
    this.totalLikes = 0
  }

  addMultipleImages(images) {
    images.forEach(image => this.addSingleImage(image))
    // debug(`Added ${images.length} images to ${this.username}`)
  }

  addSingleImage(image) {
    if (this.imageIsNew(image) && validImage(image)) {
      this.totalLikes += image.likes.count
      this.images.push(image)
    }
  }

  imageIsNew(image) {
    const id = {image}
    const matchedImages = this.images.filter(image => id == image.id)
    return matchedImages.length == 0
  }

  sortImages() {
    this.images.sort((a,b)=> {
      return b.created_time - a.created_time
    })
  }

  update() {
    this.sortImages()
    debug(`\n- ${this.username} -`)
    this.totalTravelled = totalDistance(this.images)

    this.isInteresting = this.totalTravelled > 5000 && this.totalLikes > 1400

    debug(`\n  grand total: ${this.totalTravelled}km \n`)
    debug(`\n  total likes: ${this.totalLikes} \n`)
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
