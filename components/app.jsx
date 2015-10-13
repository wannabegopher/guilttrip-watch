import React from 'react'
import io from 'socket.io-client'
import Map from './map.jsx'

export default React.createClass({

  getInitialState() {
    return {
      travellers: []
    }
  },

  componentDidMount() {
    const socket = io()
    socket.on('connect', () => {
      console.info('Client connected')
    })

    socket.on('initialTravellerSet', data => {
      console.info('Got data:', data)
    })
  },

  render() {
    return (
    <div>
      <Map/>
    </div>
    )
  },

})
