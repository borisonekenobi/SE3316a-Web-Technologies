const csv = require('csvtojson');
const {randomBytes, createHash} = require('crypto');
const jwt = require('jsonwebtoken');

const jwtExpTime = '30m';

async function csvToJSON(csvData) {
  try {
    const jsonData = await csv({
      output: "json"
    }).fromString(csvData);

    jsonData.forEach(destination => {
      destination.destination = destination.Destination; delete destination.Destination;
      destination.region = destination.Region; delete destination.Region;
      destination.country = destination.Country; delete destination.Country;
      destination.category = destination.Category; delete destination.Category;
      destination.longitude = parseFloat(destination.Longitude); delete destination.Longitude;
      destination.latitude = parseFloat(destination.Latitude); delete destination.Latitude;
      destination.annual_tourists = destination['Approximate Annual Tourists']; delete destination['Approximate Annual Tourists'];
      destination.currency = destination.Currency; delete destination.Currency;
      destination.religion = destination["Majority Religion"]; delete destination["Majority Religion"];
      destination.foods = destination['Famous Foods']; delete destination['Famous Foods'];
      destination.language = destination.Language; delete destination.Language;
      destination.best_time_visit = destination['Best Time to Visit']; delete destination['Best Time to Visit'];
      destination.cost_of_living = destination['Cost of Living']; delete destination['Cost of Living'];
      destination.safety = destination.Safety; delete destination.Safety;
      destination.cultural_significance = destination['Cultural Significance']; delete destination['Cultural Significance'];
      destination.description = destination.Description; delete destination.Description;
    });

    return jsonData;
  } catch (e) {
    console.error(e);
    return false;
  }
}

function touristToSort(tourists) {
  const info = tourists.split(' ');
  let num = parseFloat(info[0]) * 1000;
  if (info.length > 1) num *= 1000;
  return num;
}

function hash(string, salt = randomBytes(32).toString('hex')) {
  return [createHash('sha256').update(salt + string).digest('hex'), salt];
}

function generateAccessToken(user) {
  return jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: jwtExpTime });
}

function refreshToken(token) {
  const payload = jwt.verify(token, process.env.TOKEN_SECRET);
  delete payload.iat;
  delete payload.exp;
  delete payload.nbf;
  delete payload.jti;

  return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: jwtExpTime });
}

function verifyToken(req) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    return refreshToken(token);
  } catch (e) {
    return null;
  }
}

function decodeToken(token) {
  try {
    return jwt.decode(token, process.env.TOKEN_SECRET);
  } catch (e) {
    return null;
  }
}

module.exports = {
  csvToJSON,
  touristToSort,
  hash,
  generateAccessToken,
  verifyToken,
  decodeToken
}
