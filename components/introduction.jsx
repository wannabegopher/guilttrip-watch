import React from 'react'
import moment from 'moment'
import {dateFromImage} from '../lib/timefunctions'
import ReactEmoji from 'react-emoji'
import tweenState from 'react-tween-state'

export default React.createClass({

  mixins: [
    tweenState.Mixin
  ],

  getInitialState() {
    return {
      opacity: 0
    }
  },

  fade() {
    this.tweenState('opacity', {
      easing: tweenState.easingTypes.easeInOutQuad,
      duration: 100,
      endValue: 1,
      stackBehaviour: tweenState.stackBehavior.DESTRUCTIVE,
      onEnd: this.moveMap
    });

    this.tweenState('opacity', {
      easing: tweenState.easingTypes.easeInOutQuad,
      delay: 7500,
      duration: 1500,
      endValue: 0,
      onEnd: this.props.startSlideShow,
      stackBehaviour: tweenState.stackBehavior.DESTRUCTIVE
    });
  },

  moveMap() {
    const image = this.props.traveller.images[0]
    this.props.setNewMapLocation([image.location.longitude, image.location.latitude], 13)
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.traveller != this.props.traveller) {
      this.setState({
        opacity: 0
      })
      this.fade()
    }
  },

  componentDidMount() {
    this.fade()
  },

  render() {
    const traveller = this.props.traveller
    const firstImageTime = dateFromImage(traveller.images[0])
    const LastImageTime = dateFromImage(traveller.images[traveller.images.length - 1])
    var style = {
      opacity: this.getTweeningValue('opacity')
    };

    return (
      <div style={style} className="traveller-introduction">
        <h1>{ReactEmoji.emojify(traveller.fullName || traveller.username)}</h1>
        <img src={traveller.profilePicture} />
        <p className="firstSeen">Seen {moment(firstImageTime).toNow(true)} ago at {traveller.firstSpottedAt.fullName}, {traveller.firstSpottedAt.country} </p>
        <p className="distance">{Math.floor(traveller.totalTravelled)}km in {moment(LastImageTime).toNow(true)}</p>

      </div>
    )
  },
})
