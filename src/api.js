//-----------------------------------------------------------------------------
// Client Path API v1.0 🚀
//-----------------------------------------------------------------------------
import express from "express";
const router = express.Router();
import fs from "fs";

import apiKeyVerification from "./middleware/x-api-key.js";
router.use(apiKeyVerification);
import { CP_LogsLayer } from "./faunaDB.js";
import functions from "./functions.js";

import assistantManager from "./openai.js";
const aiLayer = new assistantManager();

const logsLayer = new CP_LogsLayer();

const counties = JSON.parse(fs.readFileSync("./counties.json", "utf8"));
// const fncs = new functions();

//write a function to get obj by property in array of objects
function findAbbrByName(array, key, value) {
  for (var i = 0; i < array.length; i++) {
    if (array[i][key] === value) {
      console.log(array[i].code);
      return array[i].code;
    }
  }
  return null;
}

router.post("/api/analyse", async function (req, res) {
  const data = req.body;
  let output = {
    companyData: {},
    trends: {},
    audit: {},
  };
  console.log("Aici brat" + JSON.stringify(data));
  functions.matchAndEnrich(data, 0.6).then(async (companyData) => {
    output.companyData = companyData;
    await aiLayer.generate(companyData).then((trends) => {
      functions
        .getTrends(trends.trends, "BV")
        .then((result) => {
          console.log(result);
          output.trends = result;
        })
        .catch((err) => {
          console.log(err);
        });
        output.audit = functions.checkAudit(companyData);
    });
    res.send(output);
  });
});
/*

values: [
    { query: 'games', value: '100%', extracted_value: 100 },
    { query: 'computers', value: '', extracted_value: 0 }
  ]
  */

export default router;
