//-----------------------------------------------------------------------------
// Client Path API v1.0 🚀
//-----------------------------------------------------------------------------
import express from "express";
const router = express.Router();
import fs from "fs";

// import apiKeyVerification from "./middleware/x-api-key.js";
// router.use(apiKeyVerification);
import functions from "./functions.js";

import assistantManager from "./openai.js";
const aiLayer = new assistantManager();

// const logsLayer = new CP_LogsLayer();

// const counties = JSON.parse(fs.readFileSync("./counties.json", "utf8"));
// const fncs = new functions();

router.post("/api/analyse", async function (req, res) {
  let data = req.body;
  let srchFrmt = {
    commercial_names: [],
    website: "",
  };
  srchFrmt.commercial_names.push(String(data.company_name));
  srchFrmt.website = data.company_website;

  let output = {
    companyData: {},
    audit: {},
    businessAnal: {},
  };
  console.log("Aici brat" + JSON.stringify(srchFrmt));
  
  functions.matchAndEnrich(srchFrmt, 0.6).then(async (companyData) => {
    let searchJSON = await aiLayer.generateAuditAI(companyData);
    console.log("auditJSON: ", JSON.parse(searchJSON));
    searchJSON = JSON.parse(searchJSON)
    output.companyData = companyData;
    output.businessAnal = searchJSON

    output.audit = functions.checkAudit(companyData);
    // console.log(JSON.stringify(output.audit));
    //using ejs redirect and send data to the front end
    res.render("index", {
      title: "Home",
      path: "pages/home",
      req: req || "",
      data: output,
    });
  });
});

export default router;
