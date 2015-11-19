import React from 'react'
import haversineFormatInstagramCoords from '../lib/haversineFormatInstagramCoords'
import haversine from 'haversine-distance'
import {dateFromImage} from '../lib/timefunctions'
import moment from 'moment'

export default React.createClass({

  getInitialState() {
    return {
      opacity: 0,
      previousImage: null,
      distanceFromLastImage: 4000
    }
  },

  componentDidMount() {
    this.moveMap()
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.image != this.props.image) {
      if (this.props.image) {
        const distance = haversine(haversineFormatInstagramCoords(nextProps.image), haversineFormatInstagramCoords(this.props.image)) / 1000
        console.info("Distance:" + distance, "km")
      }
    }
  },

  moveMap(props, distance) {
  },

  handleLoaded() {
    console.info("Loaded!")
  },

  render() {
    const image = this.props.image

    const locationDescription = image.location.name
    const relativeTimeDescription = moment(dateFromImage(image)).toNow(true)

    return (
      <div className="trip-image">
        <img onLoad={this.handleLoaded} src={image.images.standard_resolution.url} />
        <div className="trip-description">
          <span className="trip-description__location">{locationDescription}</span>,
          <span className="trip-description__location">{relativeTimeDescription}</span> ago
        </div>

      </div>
    )
  },
})
