require('dotenv').config()

let PORT = process.env.port || 3001
let MONGODB_URI = process.env.MONGODB_URI
let NODE_ENV = process.env.NODE_ENV || 'production'

if (NODE_ENV === 'test') {
  MONGODB_URI = process.env.TEST_MONGODB_URI
}

let SECRET = process.env.SECRET

module.exports = {
  MONGODB_URI,
  NODE_ENV,
  PORT,
  SECRET
}