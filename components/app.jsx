import React from 'react'

export default React.createClass({

  getInitialState() {
    return {
      n: 0
    }
  },

  componentDidMount() {
    console.info("On the client")
  },

  render() {
    return (
    <div>
      <h1>clicked {this.state.n} times</h1>
      <button onClick={this.handleClick}>click me!</button>
    </div>
    )
  },

  handleClick() {
    this.setState({ n: this.state.n + 1 })
  }
})
