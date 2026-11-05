import { MongoClient, ObjectId } from 'mongodb';
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://studio-space-server-tau.vercel.app/"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(async (req, res, next) => {
  try {
    await connectToMongoDB();
    next();
  } catch (error) {
    console.error("Database initialization failed:", error);

    res.status(503).json({
      message: "Database temporarily unavailable."
    });
  }
});


const client = new MongoClient(process.env.MONGODB_URI);

const db = client.db("studio-space-db");

const studiosCollection = db.collection("studios");
const myBookingCollection = db.collection("my-booking");
const myCategoryCollection = db.collection("category");

let connectionPromise;

export async function connectToMongoDB() {
  try {
    if (!connectionPromise) {
      connectionPromise = client.connect().catch((error) => {
        connectionPromise = null;
        throw error;
      });
    }

    await connectionPromise;

    return db;

  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}


// export async function connectToMongoDB() {
//   try {
//     await client.connect();
//     console.log("You successfully connected to MongoDB!");
//     return client;

//   } catch (err) {
//     console.dir(err);

//   }
// }

// connectToMongoDB();

const JWKS = createRemoteJWKSet(new URL(`${process.env.CLIENT_URL}/api/auth/jwks`));

const middleware = async (req, res, next) => {
  const authHeaders = req.headers.authorization;
  console.log(authHeaders);
  if (!authHeaders || !authHeaders.startsWith("Bearer")) {
    return res.status(401).send({
      message: "Unauthorized!",
    });
  }
  

  const token = authHeaders.split(" ")[1];
  console.log(token);
  try {
    const { payload } = await jwtVerify(token, JWKS);
    req.user = payload;
    console.log("success.");
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
app.get("/studios", async (req, res) => {
  try {
    const filter = {};
    
    const { category, limit } = req.query;
    
    if (category) {
      filter["data.category"] = category;
    }
    
    const limitNum = parseInt(limit);
    
    let result;
    if(limitNum){
      result = await studiosCollection.find(filter).limit(Math.max(1, Math.min(limitNum, 100))).toArray();
    }
    else{
      result = await studiosCollection.find(filter).toArray();
    }

    res.status(200).send(result);

  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Failed to fetch studios",
    });

  }
});

// Get all Studio that has create by you
app.get('/my-listings', middleware, async (req, res) => {
  try {
    const result = await studiosCollection.find({ "data.owner.id": req.user.id }).toArray();
    return res.status(200).json(result);

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Failed to fetch your listings!",
    });
  }
});

app.delete('/delete-listings/:id', middleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid studio ID!",
      });
    }

    const result = await studiosCollection.deleteOne({
      _id: new ObjectId(id),
      "data.owner.id": req.user.id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Studio not found or you don't have permission to delete it!",
      });
    }

    return res.status(200).json({
      message: "Studio deleted successfully.",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to delete studio!",
    });
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
    const result = await studiosCollection.insertOne({data})
    
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

// Update studio data
app.put("/studios/:id", middleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({
        message: "Invalid studio ID",
      });
    }
    
    const {
      title,
      category,
      hourlyRate,
      securityDeposit,
      maxCapacity,
      location,
      image,
      amenities,
      overview,
    } = req.body;

    const userId = req.user.id;

    const existingStudio = await studiosCollection.findOne({
      _id: new ObjectId(id),
      "data.owner.id": userId,
    });

    if (!existingStudio) {
      return res.status(404).send({
        message: "Studio not found or you are not authorized to update it.",
      });
    }

    const updatedAt = new Date();

    const updatedData = {
      "data.title": title,
      "data.category": category,
      "data.hourlyRate": hourlyRate,
      "data.securityDeposit": securityDeposit,
      "data.maxCapacity": maxCapacity,
      "data.location": location,
      "data.image": image,
      "data.amenities": amenities,
      "data.overview": overview,

      // Update root-level fields
      title,
      category,
      hourlyRate,
      securityDeposit,
      maxCapacity,
      location,
      image,
      amenities,
      overview,

      updatedAt,
    };

    const result = await studiosCollection.updateOne({
        _id: new ObjectId(id),
        "data.owner.id": userId,
      },{
        $set: updatedData,
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).send({
        message: "No changes were made.",
      });
    }

    res.status(200).send({
      success: true,
      message: "Studio updated successfully!",
    });

  } catch (error) {
    console.error("Update studio error:", error);

    res.status(500).send({
      message: "Failed to update studio.",
      error: error.message,
    });
  }
});

//Get all my booking data
app.get('/my-booking', middleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await myBookingCollection.find({ userId: userId }).toArray();

    return res.status(200).json(result);

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Failed to fetch bookings!"
    });
  }
});

// Add studio in my booking
app.post('/add-booking', middleware, async (req, res) => {
  try {
    const data = req.body;
    const userId = req.user.id;

    const existingBooking = await myBookingCollection.findOne({
      "studio._id": data.studio._id,
      date: data.date,
      status: "Confirmed",
      startTime: { $lt: data.endTime },
      endTime: { $gt: data.startTime }
    });

    if (existingBooking) {
      return res.status(409).json({
        message: "This studio is already booked during this time!"
      });
    }

    const result = await myBookingCollection.insertOne({
      ...data,
      userId,
      createdAt: new Date(),
    });

    return res.status(201).json({
      message: "Studio booked successfully.",
      insertedID: result.insertedId
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to add booking!"
    });
  }
});

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

//Get all category
app.get('/category', async (req, res) => {
  try {
    const result = await myCategoryCollection.find({}).toArray();

    return res.status(200).json(result);

  } catch (error) {
    console.error("Category fetching error:", error);

    return res.status(500).json({
      message: "Failed to fetch category data!"
    });
  }
});


app.listen(port, () => {
  console.log(`${port} Running...`);
});

export default app;