import React from 'react'
import io from 'socket.io-client'
import Map from './map.jsx'

export default React.createClass({

  getInitialState() {
    return {
      n: 0
    }
  },

  componentDidMount() {


    const socket = io()
    socket.on('connect', () => {
      console.info('Client connected')
    })

    socket.on('ping', data => {
      console.info('Got data:', data)
    })
  },

  render() {
    return (
    <div>
      <Map/>
      <h1>clicked {this.state.n} times</h1>
      <button onClick={this.handleClick}>click me!</button>
    </div>
    )
  },

  handleClick() {
    this.setState({ n: this.state.n + 1 })
  }
})
