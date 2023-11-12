import axios from "axios";
import dotenv from "dotenv";
import { getJson } from "serpapi";

dotenv.config();

const BASE_URL = "https://data.soleadify.com";
// SEARCH_ENDPOINT =  "/search/v1/companies?page_size=10&pagination_token="
const SEARCH_ENDPOINT = "/search/v2/companies";
// match and enrich
// MATCH_ENDPOINT = "https://data.soleadify.com/match/v4/companies?min_match_score=0.6"
const MATCH_ENDPOINT = "/match/v4/companies";

// async function complexSearch(payload, page_size = 10) {
//   //make a post request to the complex search endpoint
//   //with the payload
//   //return the response
//   const response = await new Promise((resolve, reject) => {
//     request.post(
//       {
//         url: `${BASE_URL}${SEARCH_ENDPOINT}?page_size=${page_size}`,
//         headers: {
//           "x-api-key": process.env.COMPLEX_SEARCH_KEY,
//         },
//         body: payload,
//         json: true,
//       },
//       (error, response, body) => {
//         if (error) {
//           console.error("Request failed:", error);
//           reject(error);
//         } else if (response.statusCode !== 200) {
//           console.error("Error:", response.statusCode, body.toString("utf8"));
//           reject(new Error(`Error: ${response.statusCode}`));
//         } else {
//           console.log("Success:", JSON.parse(body, null, 2));
//           resolve(body);
//         }
//       }
//     );
//   });
// }

async function matchAndEnrich(payload, minMatchScore = 0.6) {
  try {
    const response = await axios.post(
      `${BASE_URL}${MATCH_ENDPOINT}?min_match_score=${minMatchScore}`,
      payload,
      {
        headers: {
          "x-api-key": process.env.MATCH_ENRICH_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Success:", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Error:", error.response.status, error.response.data);
      throw new Error(`Error: ${error.response.status}`);
    } else if (error.request) {
      console.error("Request failed:", error.request);
      throw new Error("Request failed");
    } else {
      console.error("Unexpected error:", error.message);
      throw error;
    }
  }
}

async function fetchCountryData(country) {
  try {
    console.log(`Fetching data for ${country} ...`);

    const response = await new Promise((resolve, reject) => {
      request.get(
        {
          url: `https://api.api-ninjas.com/v1/country?name=${country}`,
          headers: {
            "X-Api-Key": process.env.NINJAS_KEY,
          },
        },
        (error, response, body) => {
          if (error) {
            console.error("Request failed:", error);
            reject(error);
          } else if (response.statusCode !== 200) {
            console.error("Error:", response.statusCode, body.toString("utf8"));
            reject(new Error(`Error: ${response.statusCode}`));
          } else {
            console.log("Success:", JSON.parse(body, null, 2));
            resolve(body);
          }
        }
      );
    });
    return response;
  } catch (error) {
    console.error("An error occurred:", error.message);
    return {};
  }
}

async function getTrends(trends, region_code = "B") {
  try {
    const result = await getJson({
      engine: "google_trends",
      q: trends,
      data_type: "GEO_MAP",
      geo: "RO",
      api_key: process.env.SERPAPI_KEY,
    });

    // Assuming getJson returns a promise, await the result here before further processing
    return processJsonResult(result, region_code);
  } catch (error) {
    console.error("Error in getTrends:", error);
    throw error; // Re-throwing the error for the caller to handle or propagate
  }
}

async function processJsonResult(json, region_code) {
  // Your existing logic to process the JSON result goes here

  if (json.compared_breakdown_by_region.length > 1) {
    json.compared_breakdown_by_region.forEach((region) => {
      if (region.geo == "RO-" + region_code) {
        console.log(region.values);
        return region.values;
      }
    });
  } else if (json.compared_breakdown_by_region.length === 1) {
    return json.compared_breakdown_by_region[0].values;
  } else {
    return null;
  }
}

function checkAudit(data) {
  const trust_res = {
    info: [],
    wrn: [],
    trust: 0.9,
  };

  function addInfoQuestion(question, condition) {
    const rsp = condition ? true : false;
    trust_res.info.push({ qw: question, rsp });
  }

  function addWarningQuestion(question, condition) {
    const rsp = condition ? true : false;
    trust_res.wrn.push({ qw: question, rsp });
  }

  // Good signs
  addInfoQuestion(
    "Has large employee base?",
    data.employee_count / data.num_locations >= 15
  );
  addInfoQuestion(
    "Is long enough at the marketplace?",
    data.year_founded < 2012
  );
  addInfoQuestion("Has many locations?", data.num_locations >= 3);

  // Bad signs
  addInfoQuestion("Is revenue declared?", data.estimated_revenue !== null);
  addInfoQuestion(
    "Is number of employees declared?",
    data.employee_count !== null
  );
  addInfoQuestion("Has own website?", data.website_url !== null);

  const hasSocialMedia =
    data.facebook_url !== null ||
    data.twitter_url !== null ||
    data.instagram_url !== null ||
    data.youtube_url !== null ||
    data.linkedin_url !== null;
  addInfoQuestion("Has social media?", hasSocialMedia);

  const hasContactInfo =
    data.primary_email !== null ||
    (data.emails !== null && data.emails.length > 0) ||
    data.other_emails !== null ||
    data.primary_phone !== null ||
    data.phone_numbers !== null;
  addInfoQuestion("Has phone or email of contact?", hasContactInfo);

  const hasRegionInfo =
    data.main_country !== null &&
    (data.main_city !== null || data.main_region !== null);
  addInfoQuestion("Is region of location declared?", hasRegionInfo);

  const hasStreetInfo =
    data.main_street !== null &&
    (data.main_latitude !== null ||
      (data.locations !== null && data.locations.length > 0));
  addInfoQuestion("Is street or geographic location declared?", hasStreetInfo);

  const hasValidLocationInfo =
    data.num_locations >= 1 && data.employee_count > data.num_locations;
  addWarningQuestion(
    "Company does not have locations more than its number of employees!",
    !hasValidLocationInfo
  );

  const revPerWorker = data.estimated_revenue / data.employee_count;
  const isNewCompany = data.year_founded >= 2020;
  const hasValidRevPerWorker = !(isNewCompany && revPerWorker >= 3000);
  addWarningQuestion(
    "New company does not have a revenue per worker more than 3000$!",
    hasValidRevPerWorker
  );

  const totalTests = trust_res.info.length + trust_res.wrn.length;
  const trustIndex = ((totalTests - trust_res.wrn.length) * 100) / totalTests;
  trust_res.trust = trustIndex.toFixed(2);

  return trust_res;
}

export default { fetchCountryData, matchAndEnrich, getTrends, checkAudit };
