import request from "request";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = "https://data.soleadify.com";
const X_API_KEY = "YOUR_API_KEY";
//complex search
// SEARCH_ENDPOINT =  "/search/v1/companies?page_size=10&pagination_token="
const SEARCH_ENDPOINT = "/search/v1/companies";
// match and enrich
// MATCH_ENDPOINT = "https://data.soleadify.com/match/v4/companies?min_match_score=0.6"
const MATCH_ENDPOINT = "/match/v4/companies";

async function complexSearch(payload, page_size=5) {}

async function matchAndEnrich(payload, min_match_score=0.5) {}

async function fetchCountryData(country) {
  try {
    console.log(`Fetching data for ${country} ...`);

    const response = await new Promise((resolve, reject) => {
      request.get(
        {
          url: `https://api.api-ninjas.com/v1/country?name=${country}`,
          headers: {
            'X-Api-Key': process.env.NINJAS_KEY,
          },
        },
        (error, response, body) => {
          if (error) {
            console.error('Request failed:', error);
            reject(error);
          } else if (response.statusCode !== 200) {
            console.error('Error:', response.statusCode, body.toString('utf8'));
            reject(new Error(`Error: ${response.statusCode}`));
          } else {
            console.log('Success:', JSON.parse(body, null, 2));
            resolve(body);
          }
        }
      );
    });
    return response;
  } catch (error) {
    console.error('An error occurred:', error.message);
    return {};
  }
}
export default { main, fetchCountryData };
