import React from 'react'
import tweenState from 'react-tween-state'
import haversineFormatInstagramCoords from '../lib/haversineFormatInstagramCoords'
import haversine from 'haversine-distance'
import {dateFromImage} from '../lib/timefunctions'
import moment from 'moment'

export default React.createClass({

  mixins: [
    tweenState.Mixin
  ],

  getInitialState() {
    return {
      opacity: 0,
      previousImage: null,
      distanceFromLastImage: 4000
    }
  },

  componentDidMount() {
    this.fade()
    this.moveMap()
  },

  fade() {

    const ratio = (this.state.distanceFromLastImage / 4000) + 0.5

    this.tweenState('opacity', {
      delay: 0,
      duration: 0,
      stackBehaviour: tweenState.stackBehavior.DESTRUCTIVE,
      endValue: 0
    })

    this.tweenState('opacity', {
      easing: tweenState.easingTypes.easeInOutQuad,
      delay: 1500 * ratio,
      duration: 500 * ratio,
      endValue: 0,
    })

    this.tweenState('opacity', {
      easing: tweenState.easingTypes.easeInOutQuad,
      delay: 2000 * ratio,
      duration: 2400 * ratio,
      endValue: 1,
    })

    console.info("Should be:", 2700 * ratio, " till next slide.")

    this.tweenState('opacity', {
      easing: tweenState.easingTypes.easeInOutQuad,
      delay: 2700 * ratio,
      duration: 2800 * ratio,
      endValue: 0,
      onEnd: this.props.nextSlide,
    })

  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.image != this.props.image) {

      if (this.props.image) {
        const distance = haversine(haversineFormatInstagramCoords(nextProps.image), haversineFormatInstagramCoords(this.props.image)) / 1000
        console.info("Distance:" + distance, "km")
        this.setState({
          distanceFromLastImage: distance,
          opacity: 0
        })
        this.moveMap(nextProps, distance)
      }
    }
  },

  moveMap(props, distance) {

    if (!props) {
      props = this.props
    }


    if (isNaN(distance)) {
      distance = 4000
    }

    let zoom = 13 - (distance / 1000)
    this.props.setNewMapLocation([props.image.location.longitude, props.image.location.latitude], zoom)
  },

  handleLoaded() {
    console.info("Loaded!")
    this.fade()
  },

  render() {
    const image = this.props.image
    var style = {
      opacity: this.getTweeningValue('opacity')
    }

    const locationDescription = image.location.name
    const relativeTimeDescription = moment(dateFromImage(image)).toNow(true)

    return (
      <div className="trip-image">
        <img onLoad={this.handleLoaded} style={style} src={image.images.standard_resolution.url} />
        <div className="trip-description">
          <span className="trip-description__location">{locationDescription}</span>,
          <span className="trip-description__location">{relativeTimeDescription}</span> ago
        </div>

      </div>
    )
  },
})
