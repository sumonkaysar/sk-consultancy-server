const express = require("express")
const cors = require("cors")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const reviewCollection = client.db('skConsultancy').collection('reviews')

    app.get('/services', async (req, res) => {
      const limit = parseInt(req.query.limit) || 0
      const query = {}
      const cursor = serviceCollection.find(query)
      const services = await cursor.limit(limit).toArray()

      res.send(services)
    })

    app.get('/services/:id', async (req, res) => {
      const id = req.params.id
      const query = {
        _id: ObjectId(id)
      }
      const service = await serviceCollection.findOne(query)

      res.send(service)
    })

    app.get('/reviews/:id', async (req, res) => {
      const id = req.params.id
      const query = { serviceId: {$in: [id]} }
      const cursor = reviewCollection.find(query)
      const reviews = await cursor.toArray()

      res.send(reviews)
    })

    app.post('/add-review', async (req, res) => {
      const review = req.body
      const result = await reviewCollection.insertOne(review)
      res.send(result)
    })

    app.get('/my-reviews/:email', async (req, res) => {
      const email = req.params.email
      const query = { reviewerEmail: {$in: [email]} }
      const cursor = reviewCollection.find(query)
      const reviews = await cursor.toArray()

      res.send(reviews)
    })

    app.delete('/my-reviews/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: ObjectId(id) }
      const result = await reviewCollection.deleteOne(query)

      res.send(result)
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