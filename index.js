const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SEC, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
};



app.get("/", (req, res) => {
  res.send("port a kiu paowa jaitese");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.BD_PASS}@cluster0.qfvdf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const itemCollection = client.db("STORE").collection("items");
    const userCollection = client.db("STORE").collection("users");
    
    app.get("/", (req, res) => {
      res.send("port a kiu paowa jaitese");
    });

    app.get("/inventory", verifyToken, async (req, res) => {
      const query = {};
      const cursor = itemCollection.find(query);
      const items = await cursor.toArray();
    //   console.log(items);
      res.send(items);
    });
    app.get("/myitems/:email", verifyToken,  async (req, res) => {
      const email = req.params.email;
      // console.log(email);
      const query = { email: email};
      const cursor = itemCollection.find(query);
      const items = await cursor.toArray();
      // console.log(items);
      res.send(items)
      
    });
    app.get("/inventory/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await itemCollection.findOne(query);
      // console.log(result);
      res.send(result);
    });
    app.delete("/inventory/:id", verifyToken, async (req, res) => {
      const id = req.params.id;

      const result = await itemCollection.deleteOne({ _id: ObjectId(id) });

      if (!result.deletedCount) {
        return res.send({ success: false, error: "something went wrong" });
      }

      res.send({ success: true, message: "Successfully deleted " });
    });




    app.post("/inventory",  verifyToken, async (req, res) => {
      const items = req.body;
      const result = await itemCollection.insertOne(items);

      res.send({
        success: true,
        message: `Successfully inserted ${items.name}!`,
      });
    });

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateUser = {
        $set: user,
      };
      const result = await userCollection.updateOne(
        filter,
        updateUser,
        options
      );
      const accessToken = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SEC, { expiresIn: "3h" });
      // console.log(accessToken);
      res.send({ result, accessToken });
    });
    app.put("/inventory/:id", verifyToken, async (req, res) => {
      const items = req.body;
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const updateItem ={
        $set: items
      }
      // console.log(updateItem);
      const result = await itemCollection.updateOne(filter, updateItem);
      // console.log(result);
      res.send({
        success: true,
        message: `Successfully Update ${items.name}!`,
      });
    });
    app.put("/delivery/:id", verifyToken,  async (req, res) => {
      const deliverItems = req.body;
      const id = req.params.id;
      // console.log(deliverItems);
      const filter = { _id: ObjectId(id) };
      const item = await itemCollection.findOne(filter);
      const newQuantity = parseInt(item.quantity) - parseInt(deliverItems.quantity);
      // console.log(item);
      // console.log(newQuantity);
      const delivery ={
        $set: {quantity: newQuantity}
      }
  
      const result = await itemCollection.updateOne(filter, delivery);
      // console.log(result);
      res.send({
        success: true,
        message: `Successfully Update ${deliverItems.name}!`,
      });
    });
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("bd connected", port);
});
