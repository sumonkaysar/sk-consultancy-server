const express = require("express")
const cors = require("cors")
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

// middlewares
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zuoxzfe.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })

async function run () {
  try{
    const serviceCollection = client.db('skConsultancy').collection('services')

    app.get('/services', async (req, res) => {
      const limit = parseInt(req.query.limit) || 0
      const query = {}
      const cursor = serviceCollection.find(query)
      const services = await cursor.limit(limit).toArray()

      res.send(services)
    })
  } finally {

  }
}

run().catch(err => console.log(err))

app.get("/", (req, res) => {
  res.send("Server is Running")
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})