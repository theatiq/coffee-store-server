const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config()
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hnhnv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const coffeeCollections = client.db("coffeesDB").collection('coffees')
        const userCollection = client.db("coffeesDB").collection("users")
        app.get("/coffee", async (req, res) => {
            const cursor = coffeeCollections.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get("/coffee/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await coffeeCollections.findOne(query)
            res.send(result)
        })


        app.post("/coffee", async (req, res) => {
            const newCoffee = req.body
            console.log(newCoffee)
            const result = await coffeeCollections.insertOne(newCoffee)
            res.send(result)
        })

        app.put("/coffee/:id", async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedCoffee = req.body
            const coffee = {
                $set: updatedCoffee

            }
            const result = await coffeeCollections.updateOne(filter, coffee, options)
            res.send(result)

        })

        app.delete("/coffee/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await coffeeCollections.deleteOne(query)
            res.send(result)
        })

        // Users related api

        app.get("/users", async (req, res) => {
            const cursor = userCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.post("/users", async (req, res) => {
            const newUser = req.body
            console.log("New user: ", newUser)
            const result = await userCollection.insertOne(newUser)
            res.send(result)
        })

        app.patch("/users", async (req, res) => {
            const email = req.body.email
            const filter = { email }
            const updatedDoc = {
                $set: {
                    lastSignInTime: req.body?.lastSignInTime
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc)
            res.send(result)
        })

        app.delete("/users/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query)
            res.send(result)
        })





        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("Coffee server is running smoothly.......")
})

app.listen(port, () => {
    console.log(`Coffee server is running on Port: ${port}`)
})

