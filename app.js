const express = require('express')
const app = express()

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbpath = path.join(__dirname, 'covid19India.db')

module.exports

let db = null

const instalizeDataserver = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })

    app.listen(30000, () => {
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
  const getststesQuery = `select * from state;`

  const getstateDetails = await db.all(getststesQuery)
  response.send(getstateDetails)
})
