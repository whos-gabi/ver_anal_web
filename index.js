import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const cors = require("cors");
import cors from 'cors';
// const bodyParser = require("body-parser");
import bodyParser from 'body-parser';
import apiRoutes from './src/api.js'; 

//ENV file config
import dotenv from 'dotenv';
dotenv.config();
const app = express();

// --------middleware---------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));

app.get("/", function (req, res) {
  res.render("index", { title: "Home", path: "pages/home", req: req || "", data: null });
});

app.post("/api/analyse", apiRoutes);

// app.get("/", function (req, res) {
//   res.send("Client Path API v1.0 🚀");
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Client Path API is listening on port: ${PORT}`);
});