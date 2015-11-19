
import mapboxgl from 'mapbox-gl'
import React from 'react'

export default React.createClass({

  componentWillReceiveProps(nextProps) {
    if (this.locationIsNew(nextProps)) {
      console.info(nextProps)
      this.map.jumpTo({
        center: nextProps.location.slice(),
        zoom: Math.floor(nextProps.zoom)
        // easing: (t) => {
        //   return t
        //
        //   t = (t-0.5)*-12
        //
        //   let res = (1/(1 + Math.exp(t)))
        //
        //   console.info(t, res)
        //
        //   // return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t
        // }
      })
    }
  },

  locationIsNew(nextProps) {
    return !(this.props.zoom == nextProps.zoom && this.props.location[0] == nextProps.location[0] && this.props.location[1] == nextProps.location[1])
  },

  componentDidMount() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZXZlbndlc3R2YW5nIiwiYSI6ImFBYWt4blUifQ.QwErrY0yQBcC9ST5UWp4Rg'

    this.map = new mapboxgl.Map({
        container: 'map',
        style: '/mapboxstyle.json',
        center: this.props.location,
        zoom: this.props.zoom
    })

    // this.map.setPitch(20)

  },

  render() {
    return <div id="map"/>
  },


})
