const serverless = require('serverless-http');
const app = require('../Backend/server');
module.exports = serverless(app);
