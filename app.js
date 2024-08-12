const express = require('express')
const app = express()

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbpath = path.join(__dirname, 'covid19India.db')

module.exports = app
app.use(express.json())

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
  const getstatesQuery = `select * FROM state;`

  const statesArray = await db.all(getstatesQuery)
  response.send(
    statesArray.map(eachstate =>
      convertsnaketoCamelCaseStateDetails(eachstate),
    ),
  )
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
  const postDistrictQuery = `
  INSERT INTO district(district_name,state_id,cases,cured,active,deaths)
   VALUES('${districtName}',${stateId},${cases},${cured},${active},${deaths});`
  await db.run(postDistrictQuery)
  response.send('District Successfully Added')
})

//API4

app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const getdistrictQuery = `select * FROM district WHERE district_id=${districtId};`
  const getdistrictDetails = await db.get(getdistrictQuery)

  response.send(convertsnaketoCamleCaseDistrictDetails(getdistrictDetails))
})

//API5

app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const deleteQuery = ` DELETE FROM district WHERE district_id=${districtId};`
  const getdelete = await db.run(deleteQuery)
  response.send('District Removed')
})

//API6

app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const updateQuery = `UPDATE district SET 
  district_name='${districtName}',
  state_id=${stateId},
  cases=${cases},
  cured=${cured},
  active=${active},
  deaths=${deaths}
  WHERE district_id=${districtId};

  `
  await db.run(updateQuery)

  response.send('District Details Updated')
})

//API7

app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const getStatsQuery = ` 
  
  SELECT 
  SUM(cases),
  SUM(cured),
  SUM(active),
  SUM(deaths)
  FROM district 
  WHERE state_id=${stateId};

  `
  const sumStats = await db.get(getStatsQuery)
  console.log(sumStats)
  response.send({
    totalCases: sumStats['SUM(cases)'],
    totalCured: sumStats['SUM(cured)'],
    totalActive: sumStats['SUM(active)'],
    totalDeaths: sumStats['SUM(deaths)'],
  })
})

//API8

app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const getstateQuery = `SELECT state_id FROM district WHERE district_id=${districtId}`
  const getstateId = await db.get(getstateQuery)

  const getstatenameQuery = `SELECT state_name AS stateName FROM state WHERE state_id=${getstateId.stateId}`
  const statenameDetails = await db.get(getstatenameQuery)
  response.send(statenameDetails)
})
