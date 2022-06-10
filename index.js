const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
    
    app.get("/", (req, res) => {
      res.send("port a kiu paowa jaitese");
    });

    app.get("/inventory", async (req, res) => {
      const query = {};
      const cursor = itemCollection.find(query);
      const items = await cursor.toArray();
    //   console.log(items);
      res.send(items);
    });
    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await itemCollection.findOne(query);
      res.send(result);
    });
    app.delete("/inventory/:id", async (req, res) => {
      const id = req.params.id;

      const result = await itemCollection.deleteOne({ _id: ObjectId(id) });

      if (!result.deletedCount) {
        return res.send({ success: false, error: "something went wrong" });
      }

      res.send({ success: true, message: "Successfully deleted " });
    });
    app.post("/inventory", async (req, res) => {
      const items = req.body;
      const result = await itemCollection.insertOne(items);

      res.send({
        success: true,
        message: `Successfully inserted ${items.name}!`,
      });
    });
    app.put("/inventory/:id", async (req, res) => {
      const items = req.body;
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      // console.log(items);
      const updateItem ={
        $set: items
      }
      const result = await itemCollection.updateOne(query, updateItem, options);
      // console.log(result);
      res.send({
        success: true,
        message: `Successfully Update ${updateItem.name}!`,
      });
    });
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("bd connected", port);
});
