import React from 'react'
import Image from './image.jsx'
import Introduction from './introduction.jsx'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import TimerMixin from 'react-timer-mixin'

export default React.createClass({

  mixins: [TimerMixin],

  getInitialState() {
    return {
      currentImageIndex: null,
      nextImageAtTime: null,
      slidesStarted: false
    }
  },

  componentDidMount() {
    this.resetPlayback()
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.traveller != this.props.traveller) {
      console.info("*", nextProps)
      console.info("New traveller:", nextProps.traveller.fullName, "with " + nextProps.traveller.images.length, "images")
      // New traveller incoming
      this.resetPlayback()
    }
  },

  resetPlayback() {
    this.setState({
      slidesStarted: false
    })
    this.setImageIndex(null)
    this.setTimeout(this.endIntroduction, 3000)
  },

  endIntroduction() {
    console.info("Start slides")
    this.setState({
      slidesStarted: true
    })
    this.setImageIndex(0)
  },

  advanceSlideState() {
    console.info("Nextslide!")
    console.info("----")
    if (this.state.currentImageIndex < this.props.traveller.images.length - 1) {
      this.setImageIndex(this.state.currentImageIndex + 1)
    } else {
      // All out of images set new traveller
      console.info("Out of images. Set new traveller.")
      this.props.setNewTraveller()
    }
  },

  setImageIndex(index) {
    this.setState({
      currentImageIndex: index
    })
  },

  currentImage() {
    return this.props.traveller.images[this.state.currentImageIndex]
  },

  render() {
    const traveller = this.props.traveller

    let nextImage = null

    return (
      <div className="traveller">
          <ReactCSSTransitionGroup transitionName="fade" transitionAppear={true} transitionAppearTimeout={100} transitionLeaveTimeout={3000}>
            {
              !this.state.slidesStarted &&
              <Introduction setNewMapLocation={this.props.setNewMapLocation} traveller={traveller} />
            }
          </ReactCSSTransitionGroup>
        {
          this.state.slidesStarted &&
          <div>
            <img className="traveller__profile-picture" src={traveller.profilePicture} />
            <h1 className="traveller__name">{traveller.fullName || traveller.username}</h1>
          </div>
        }
        {
          false && this.state.currentImageIndex !== null &&
          <Image advanceSlideState={this.advanceSlideState} image={this.currentImage()} />
        }
      </div>
    )
  },


})
