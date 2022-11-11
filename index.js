const express = require("express")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

// middlewares
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zuoxzfe.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization
  if(!authHeader) {
    res.status(401).send({message: 'Unauthorized access'})
  }
  const token = authHeader.split(" ")[1]
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if(err){
      res.status(401).send({message: 'Unauthorized access'})
    }
    req.decoded = decoded
    next()
  })
}

async function run () {
  try{
    const serviceCollection = client.db('skConsultancy').collection('services')
    const reviewCollection = client.db('skConsultancy').collection('reviews')

    app.post('/jwt', (req, res) => {
      const user = req.body
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
      res.send({token})
    })

    app.get('/services', async (req, res) => {
      const limit = parseInt(req.query.limit) || 0
      const query = {}
      const cursor = serviceCollection.find(query)
      const services = await cursor.limit(limit).toArray()

      res.send(services)
    })

    app.post('/services', async (req, res) => {
      const service = req.body
      const result = await serviceCollection.insertOne(service)
      res.send(result)
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

    app.get('/my-reviews/:email', verifyJWT, async (req, res) => {

      const email = req.params.email
      
      const decoded = req. decoded
      if (decoded?.user?.email !== email) {
        res.status(403).send({message: "Unauthorized access"})
      }

      const query = { reviewerEmail: {$in: [email]} }
      const cursor = reviewCollection.find(query)
      const reviews = await cursor.toArray()

      res.send(reviews)
    })

    app.put('/my-reviews/:id', async (req, res) => {
      const id = req.params.id
      const {reviewText} = req.body
      const query = { _id: ObjectId(id) }
      const updatedDoc = {
        $set: {
          reviewText: reviewText
        }
      }
      const result = await reviewCollection.updateOne(query, updatedDoc)

      res.send(result)
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