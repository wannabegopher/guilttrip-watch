
import validImage from './validImage'
import haversine from 'haversine-distance'
import haversineFormatInstagramCoords from '../../lib/haversineFormatInstagramCoords'
import moment from 'moment'
import debug from '../debug'
import {dateFromImage} from '../../lib/timefunctions'

function calculateDistanceInKm(image1, image2) {
  if (!image1.location || !image2.location ) { return 0 }
  return haversine(haversineFormatInstagramCoords(image1), haversineFormatInstagramCoords(image2)) / 1000
}

export default function(images) {

  let image1, image2
  let totalTravelled = 0

  let legs = []

  for (let i = 0; i < images.length - 1; i++) {

    const currentImage = images[i]

    // Find start of chain. Skip until we have one.
    if (!image1) {
      if (validImage(currentImage)) {
        image1 = currentImage
      }
      continue
    }

    // If we have a source, find the destination or try next
    if (validImage(currentImage)) {
      image2 = currentImage
    } else {
      continue
    }

    const km = calculateDistanceInKm(image1, image2)

    const date1 = dateFromImage(image1)
    const date2 = dateFromImage(image2)

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

    totalTravelled += km
    image1 = image2
  }

  return totalTravelled
}
