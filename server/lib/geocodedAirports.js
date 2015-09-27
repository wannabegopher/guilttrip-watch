import debug from '../debug'

function mungeAirports() {

  let airports = require('../../data/airports/airports.json')
  let mostFrequented = require('../../data/airports/30_most_frequented_airports.json')

  debug('Importing all airports')

  let airportsByICOA = {}

  airports.forEach(airport => {
    airportsByICOA[airport.ICOA] = airport
  })

  debug('Imported', Object.keys(airportsByICOA).length, 'airports')

  mostFrequented = mostFrequented.map(airport => {
    const ICOA = airport.codes.split('/')[1]
    const airportData = airportsByICOA[ICOA]
    const {latitude} = airportData
    const {longitude} = airportData

    airportData.passengers = airport.passengers.replace(/,/g,'')
    airportData.fullName = airport.name.trim()
    return airportData
  })

  debug('Annotated most frequent airports')

  return mostFrequented
}

export default mungeAirports()
