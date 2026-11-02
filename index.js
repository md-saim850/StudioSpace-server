import { MongoClient, ObjectId } from 'mongodb';
import express from 'express';
import 'dotenv/config';
import cors from 'cors';

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("studio-space-db");

const studiosCollection = db.collection("studios");
const myBookingCollection = db.collection("my-booking");
const myListingsCollection = db.collection("my-listings");

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;

  } catch (err) {
    console.dir(err);

  }
}

connectToMongoDB();


app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Get all studios data
app.get('/studios', async(req, res) => {
  try{
    const result = await studiosCollection.find({}).toArray();
    return res.json(result);
    
  }catch(error){
    console.log(error);
    return res.status(204).json({
      message:"Failed to fetch studios data!"
    })

  }
})

// Get specifice studios data
app.get('/studios/:id', async(req, res) => {
  try{
    const id = req.params.id;
    const result = await studiosCollection.findOne({_id:new ObjectId(id)});
    return res.json(result);
    
  }catch(error){
    console.log(error);
    return res.status(204).json({
      message:"Failed to fetch studios data!"
    })

  }
})

// Add Studio in my listing
app.post('/add-studio', async(req, res) =>{
  try{
    const data = req.body;
    const result = await myListingsCollection.insertOne({data})
    
    return res.status(201).json({
      message: "Studio added successfully.",
      insertedID: result.insertedId
    })

  }catch(error){
    console.log(error);
    return res.status(500).json({
      message:"Failed to add studio!"
    })
    
  }
})

//Get all my booking data
app.get('/my-booking', async(req, res) => {
  try{
    const result = await myBookingCollection.find({}).toArray();
    return res.json(result);
    
  }catch(error){
    console.log(error);
    return res.status(204).json({message:"Failed to fetch My Booking!"})
  }
})

// Add studio in my booking
app.post('/add-booking', async(req, res) =>{
  try{
    const data = req.body;
    const result = await myBookingCollection.insertOne({...data})
    
    return res.status(201).json({
      message: "Studio added in My Booking.",
      insertedID: result.insertedId
    })

  }catch(error){
    console.log(error);
    return res.status(500).json({
      message:"Failed to add studio in My Booking!"
    })
    
  }
})

app.delete("/delete-booking/:id", async(req, res) => {
  try{
    const {id} = req.params
    
    const result = await myBookingCollection.deleteOne({
      _id: new ObjectId(id)
    })

    if(result.deletedCount === 0){
      return res.status(404).send({
        message: "Studio not found"
      });   
    }

    res.send({
      message: "Studio deleted successfully"
    });

  }catch(error){
    console.log(error);
    res.status(500).send({
      message: "Failed to delete Studio"
    });
    
  }
})

//Get all my booking data
app.get('/my-listing', async(req, res) => {
  try{
    const result = await myListingsCollection.find({}).toArray();
    return res.json(result);
    
  }catch(error){
    console.log(error);
    return res.status(204).json({message:"Failed to fetch My Listing!"})
  }
})

app.delete("/delete-listing/:id", async(req, res) => {
  try{
    const {id} = req.params
    
    const result = await myListingsCollection.deleteOne({
      _id: new ObjectId(id)
    })

    if(result.deletedCount === 0){
      return res.status(404).send({
        message: "Studio not found"
      });   
    }

    res.send({
      message: "Studio deleted successfully"
    });

  }catch(error){
    console.log(error);
    res.status(500).send({
      message: "Failed to delete Studio"
    });
    
  }
})

app.listen(port, () => {
  console.log(`${port} Running...`);
});