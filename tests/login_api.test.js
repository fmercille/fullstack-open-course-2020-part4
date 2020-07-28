const mongoose = require('mongoose')
const supertest = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const config = require('../utils/config')

const BASE_PATH = '/api/login'

beforeEach(async () => {
  await helper.populateUsersAndBlogs()
})

afterAll(() => {
  mongoose.connection.close()
})

describe('login API - POST /', () => {
  test('login with correct password returns valid token', async () => {
    const credentials = {
      'username': 'foobar1',
      'password': 'password1'
    }

    const postResponse = await api.post(`${BASE_PATH}/`).send(credentials)
    expect(postResponse.status).toBe(200)
    expect(postResponse.header['content-type']).toMatch(/application\/json/)
    expect(postResponse.body.token).toBeDefined()

    const decodedToken = jwt.verify(postResponse.body.token, config.SECRET)
    expect(decodedToken.id).toBeDefined()
    expect(decodedToken.id).toBe('5a422a851b54a006234d17f2')
  })

  test('login with wrong password fails', async () => {
    const credentials = {
      'username': 'foobar1',
      'password': 'badpassword'
    }

    const postResponse = await api.post(`${BASE_PATH}/`).send(credentials)
    expect(postResponse.status).toBe(401)
    expect(postResponse.header['content-type']).toMatch(/application\/json/)
    expect(postResponse.body.error).toBeDefined()
  })
})
