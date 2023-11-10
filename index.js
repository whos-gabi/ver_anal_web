import express from 'express';
const app = express();
// const cors = require("cors");
import cors from 'cors';
// const bodyParser = require("body-parser");
import bodyParser from 'body-parser';
import apiRoutes from './src/api.js'; 
import assistantManager from './src/openai.js';
const cpAi = new assistantManager();
//ENV file config
import dotenv from 'dotenv';
dotenv.config();

// --------middleware---------
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());


app.get("/api/search", apiRoutes);
app.post("/api/search/competitors", apiRoutes);

app.get("/", function (req, res) {
  res.send("Client Path API v1.0 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Client Path API is listening on port: ${PORT}`);
  cpAi.createAssistant();
});
