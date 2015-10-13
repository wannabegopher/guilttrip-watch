
import mapboxgl from 'mapbox-gl'
import React from 'react'


export default React.createClass({

  componentDidMount() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZXZlbndlc3R2YW5nIiwiYSI6ImFBYWt4blUifQ.QwErrY0yQBcC9ST5UWp4Rg'

    var map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/streets-v8', //stylesheet location
        center: [-74.50, 40], // starting position
        zoom: 9 // starting zoom
    })
  },

  render() {
    return <div id="map"/>
  },



})
