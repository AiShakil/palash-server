const express = require('express')
const { MongoClient,ServerApiVersion  } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const cors = require('cors')
const fileUpload = require('express-fileupload')

const app = express();
const port = process.env.PORT || 5000

//Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ack9d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
        await client.connect();
        const database = client.db("softzino");
        const productCollection = database.collection("products");
        const userCollection = database.collection("users");
        console.log("Database connection successfully");

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user)
            res.json(result)
        });
        //Recive users from Client site when user will be registered
        app.get('/users', async (req, res) => {
            const users = userCollection.find({})
            const result = await users.toArray()
            res.json(result);
        })
        //Recieve product from dashboard-> add product
        app.post('/products', async (req, res) => {
            const name = req.body.name;
            const price = req.body.price;
            const description = req.body.description;

            const image = req.files.image;
            const imageData = image.data;
            const encodedImage = imageData.toString('base64')
            const imageBuffer = Buffer.from(encodedImage, 'base64')
            const product = {
                name,
                price,
                description,
                image: imageBuffer
            }
            const result = await productCollection.insertOne(product);
            res.json(result)
        })
        //Display products 
        app.get('/products', async (req, res) => {
            const products = productCollection.find({})
            const result = await products.toArray()
            res.json(result);
        })
        //Delete Products from Database
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productCollection.deleteOne(query)
            res.json(result)
        })
        //Update Products from Database
        app.put('/products/:id', async(req, res)=>{
            const id = req.body.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: req.body.name,
                    price: req.body.price,
                    description: req.body.description,
                },
            };
            console.log(updateDoc);
            const result = await productCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })
    } finally {
        //   await client.close();
    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Database Connect Successfully')
})

app.listen(port, () => {
  console.log(`Starting Port:  ${port}`)
})