import http from 'http'
import express from 'express'
import hbs from 'express-handlebars'
import React from 'react/addons'
import App from './components/app'


import config from './config'
import InstagramAirportListener from './server/InstagramAirportPollingListener'

import debug from './server/debug'

const environment = process.env.NODE_ENV || 'development'
const port = config[environment].port

const app = express()

app.engine('html', hbs({ extname: 'html' }));
app.set('view engine', 'html');
app.locals.settings['x-powered-by'] = false;


app.get('/', function home (req, res, next) {
  res.render('layout', {
    reactHtml: React.renderToString(<App />)
  });
});

app.use(express.static('public'))

const server = require('http').Server(app)
const ioSocket = require('socket.io')(server)

ioSocket.on('connection', function (socket) {
  debug('Client connected')
})

ioSocket.on('connection', function (socket) {
  debug('Client connected')
})

new InstagramAirportListener({
  app: app,
  ioSocket: ioSocket,
})

function emitRandom() {
  ioSocket.emit('ping', {ping: Math.random()})
  setTimeout(emitRandom, 1000)
}

emitRandom()

server.listen(port);

console.info(`Server running on port ${port}`)
