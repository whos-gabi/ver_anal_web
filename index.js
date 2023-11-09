import express from 'express';
const app = express();
// const cors = require("cors");
import cors from 'cors';
// const bodyParser = require("body-parser");
import bodyParser from 'body-parser';
import apiRoutes from './src/api.js'; 
//ENV file config
import dotenv from 'dotenv';
dotenv.config();

// --------middleware---------
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const BASE_URL = "https://data.soleadify.com";
const X_API_KEY = "YOUR_API_KEY";
//complex search
// SEARCH_ENDPOINT =  "/search/v1/companies?page_size=10&pagination_token="
const SEARCH_ENDPOINT = "/search/v1/companies";
// match and enrich
// MATCH_ENDPOINT = "https://data.soleadify.com/match/v4/companies?min_match_score=0.6"
const MATCH_ENDPOINT = "/match/v4/companies";

app.get("/api/search", apiRoutes);
app.post("/api/search/competitors", apiRoutes);

app.get("/", function (req, res) {
  res.send("Client Path API v1.0 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Client Path API is listening on port: ${PORT}`);
});
