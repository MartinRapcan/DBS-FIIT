if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Setup express app
const express = require('express')
const app = express()

// Setup client that connects to db
const { Client } = require('pg')
const client = new Client({
  host: process.env.HOST,
  port: '5432',
  user: process.env.NAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
})
client.connect()

// Define get request on specific URL
app.get('/v1/health', async(req, res) => {
  try{
    const responseVersion = await client.query('SELECT VERSION()')
    const responseLength = await client.query(`SELECT pg_database_size('dota2')/1024/1024 as dota2_db_size`)
    const response = {
      "pgsql": {
        "version": responseVersion.rows[0]["version"],
        "dota2_db_size": parseInt(responseLength.rows[0]["dota2_db_size"])
     }
    }
    res.status(200).json(response)
  }catch(e){
    res.json(e)
  }
})

// All other routes send 404 and empty JSON
app.all("*", (req, res) => {
  res.status(404).json({})
})

// Setup port for app to listen
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port:${PORT}`)
})