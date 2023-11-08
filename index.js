const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();


const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nqal8de.mongodb.net/?retryWrites=true&w=majority`;

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

        const servicesCollection = client.db("coffeeDB").collection("coffee");
        // console.log(servicesCollection)
        const bookingCollection = client.db("coffeeDB").collection("bookings");

        //services
        app.post('/services', async (req, res) => {
            const newService = req.body;
            console.log(newService);
            const result = await servicesCollection.insertOne(newService);
            res.send(result);
        })

        app.get('/services/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await servicesCollection.findOne(query);
            res.send(result);
        })


        app.put('/services/:id', async(req , res) =>{
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)}
            const options = { upsert: true};
            const updatedServices = req.body;
            const services = {
                $set:{
                    serviceName: updatedServices.serviceName, 
                    img: updatedServices.img, 
                    price: updatedServices.price,
                     email: updatedServices.email,
                      area: updatedServices.area, 
                      description: updatedServices.description, 
                      providerName : updatedServices.providerName,
                }
            }

            const result = await servicesCollection.updateOne(filter, services, options);
            res.send(result);
        })


        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find()
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }

            const options = {
                projection: { title: 1, price: 1, service_id: 1, img: 1, description: 1 }
            }

            const result = await servicesCollection.findOne(query, options);
            res.send(result);
        })

        app.delete("/services/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await servicesCollection.deleteOne(query);
            res.send(result);
        })

        //bookings 

        app.get('/bookings', async (req, res) => {
            console.log(req.query.email);
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await bookingCollection.find(query).toArray();
            res.send(result)
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            console.log(booking);
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        });

        app.patch('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updatedBooking = req.body;
            console.log(updatedBooking);
            const updateDoc = {
                $set: {
                    status: updatedBooking.status
                },
            };
            const result = await bookingCollection.updateOne(filter, updateDoc);
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Puppies and Runnig on the House')
})

app.listen(port, () => {
    console.log(`Purrfect Pathways server is runnig on port ${port}`)
})