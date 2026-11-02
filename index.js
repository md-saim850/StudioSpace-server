import { MongoClient, ObjectId } from 'mongodb';
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("studio-space-db");

const studiosCollection = db.collection("studios");
const myBookingCollection = db.collection("my-booking");
const myListingsCollection = db.collection("my-listings");
const myCategoryCollection = db.collection("category");

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

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
);

const middleware = async (req, res, next) => {
  const authHeaders = req.headers.authorization;

  if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
    return res.status(401).send({
      message: "Unauthorized!",
    });
  }

  const token = authHeaders.split(" ")[1];

  try {
    const { payload } = await jwtVerify(token, JWKS);

    req.user = payload;

    next();
  } catch (error) {
    return res.status(401).send({
      message: "Invalid or expired token!",
    });
  }
};

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Get all studios data
app.get('/studios', async (req, res) => {
  try {
    let query = studiosCollection.find({});

    if (req.query.limit) {
      const limitNum = parseInt(req.query.limit, 10);

      if (isNaN(limitNum) || limitNum <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid limit value"
        });
      }

      query = query.limit(limitNum);
    }

    const result = await query.toArray();

    return res.json(result);

  } catch (error) {
    console.log(error);
    return res.status(204).json({
      message:"Failed to fetch studios data!"
    })
  }
}); 

// Get specifice studios data
app.get('/studios/:id', middleware, async(req, res) => {
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
app.post('/add-studio', middleware, async(req, res) =>{
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
app.get('/my-booking', middleware, async(req, res) => {
  try{
    const result = await myBookingCollection.find({}).toArray();
    return res.json(result);
    
  }catch(error){
    console.log(error);
    return res.status(204).json({message:"Failed to fetch My Booking!"})
  }
})

// Add studio in my booking
app.post('/add-booking', middleware, async(req, res) =>{
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

//Delete my booking data
app.delete("/delete-booking/:id", middleware, async(req, res) => {
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
app.get('/my-listing', middleware, async(req, res) => {
  try{
    const result = await myListingsCollection.find({}).toArray();
    return res.json(result);
    
  }catch(error){
    console.log(error);
    return res.status(204).json({message:"Failed to fetch My Listing!"})
  }
})

//Delete my listing data
app.delete("/delete-listing/:id", middleware, async(req, res) => {
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

//Get all category
app.get('/category', async (req, res) => {
  try {
    let query = myCategoryCollection.find({});

    if (req.query.limit) {
      const limitNum = parseInt(req.query.limit, 10);

      if (isNaN(limitNum) || limitNum <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid limit value"
        });
      }

      query = query.limit(limitNum);
    }

    const result = await query.toArray();

    return res.json(result);

  } catch (error) {
    console.log(error);
    return res.status(204).json({
      message:"Failed to fetch category data!"
    })
  }
}); 

app.listen(port, () => {
  console.log(`${port} Running...`);
});