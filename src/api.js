//-----------------------------------------------------------------------------
// Client Path API v1.0 🚀
//-----------------------------------------------------------------------------
import express from "express";
const router = express.Router();

import apiKeyVerification from "./middleware/x-api-key.js";
router.use(apiKeyVerification);
import { CP_LogsLayer } from "./faunaDB.js";
import functions from "./functions.js";

const logsLayer = new CP_LogsLayer();
// const fncs = new functions();

router.get("/api", function (req, res) {
  res.send("this is api");
});

//make a post route that takes a search object from the client
//and returns a list of companies
router.post("/api/search/competitors", async function (req, res) {
  const data = req.body;
  // res.send("Pidar Nahui, iaca requestul tau: \n" + JSON.stringify(req.body, null, 2));
  /*
    {
        "name"
        "activity_desc"
        "country"
        "country_code"
        "investment" 1k-500k
    }
    */
  //get user input data
  console.log(">>> User Input: \n" + JSON.stringify(data, null, 2));
  // tell ai to generate Complex search API post body filters
  //Company Business Category
  //Company Keywords
  //Company Products / Services

  //call veridion api

  // save logs in fauna

  //get top 3 competitors, return to frontend
  // const dbres = await logsLayer.addLogs(req.body);
  // console.log("Resulrt Fauna: " + JSON.stringify(dbres, null, 2));

  // console.log(JSON.stringify(await functions.fetchCountryData(data.country), null, 2));
  // const result = await functions.fetchCountryData(data.country);

  // res.send(
  //   "Pidar Nahui, iaca requestul tau: \n" + JSON.stringify(dbres, null, 2)
  // );
  res.send("Pidar Nahui, iaca requestul tau: \n");
});

router.post("/api/search/partners", function (req, res) {
  //user data:
  /*
    {
        "name"
        "activity_desc"
        "country"
        "country_code"
        "investment" 1k-500k
    }
    */
  //ask ai to generate a search body based on potential partners for this industry/company
  //call veridion api
  // save logs in fauna
  //return 2-5 or null
});

router.get("/api/search/customers", function (req, res) {
  //this api should return a detalied response of customer profile
  res.send("this is api search customers");
});

export default router;
