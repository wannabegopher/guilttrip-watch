import React from 'react'
import moment from 'moment'
import {dateFromImage} from '../lib/timefunctions'
import ReactEmoji from 'react-emoji'

export default React.createClass({


  moveMap() {
    const image = this.props.traveller.images[0]
    this.props.setNewMapLocation([image.location.longitude, image.location.latitude], 13)
  },

  componentWillReceiveProps(nextProps) {

  },

  render() {
    const traveller = this.props.traveller
    const firstImageTime = dateFromImage(traveller.images[0])
    const LastImageTime = dateFromImage(traveller.images[traveller.images.length - 1])

    return (
      <div key="1" className="traveller-introduction">
        <img src={traveller.profilePicture} />
        <h1>{ReactEmoji.emojify(traveller.fullName || traveller.username)}</h1>
        <p className="firstSeen">Seen <strong>{moment(firstImageTime).toNow(true)} ago</strong> at <strong>{traveller.firstSpottedAt.fullName}, {traveller.firstSpottedAt.country}</strong> </p>
        <p className="distance"><strong>{Math.floor(traveller.totalTravelled)}</strong>km in <strong>{moment(LastImageTime).toNow(true)}</strong></p>
      </div>
    )
  },
})
