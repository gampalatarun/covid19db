const express = require('express')
const app = express()

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbpath = path.join(__dirname, 'covid19India.db')

module.exports = app

let db = null

const instalizeDataserver = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`Db error:${e.message}`)
    process.exit(1)
  }
}

instalizeDataserver()

const convertsnaketoCamelCaseStateDetails = db => {
  return {
    stateId: db.state_id,
    stateName: db.state_name,
    population: db.population,
  }
}

const convertsnaketoCamleCaseDistrictDetails = db => {
  return {
    districtName: db.district_name,
    stateId: db.state_id,
    cases: db.cases,
    cured: db.cured,
    active: db.active,
    deaths: db.deaths,
  }
}

//API1

app.get('/states/', async (request, response) => {
  const getstatesQuery = `select * from state ORDER BY state_id;`

  const statesArray = await db.all(getstatesQuery)
  const convertedStateDetails = statesArray.map(eachstate =>
    convertsnaketoCamelCaseStateDetails(eachstate),
  )

  response.send(convertedStateDetails)
})

//API2

app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const getstateQuery = `SELECT * FROM state WHERE state_id=${stateId};`
  const stateDetails = await db.get(getstateQuery)

  response.send(convertsnaketoCamelCaseStateDetails(stateDetails))
})

//API3

app.post('/districts/', async (request, response) => {
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const postDistrictQuery = ` INSERT INTO director(district_name,state_id,cases,cured,active,deaths) VALUES('${districtName}',${stateId},${cases},${cured},${active},${deaths})`
  await db.run(postDistrictQuery)
  response.send('District Successfully')
})
