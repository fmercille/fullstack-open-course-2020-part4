const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const User = require('../models/user')

const BASE_PATH = '/api/users'

let initialUsers = []

beforeEach(async () => {
  await User.deleteMany({})

  initialUsers = [
    { _id: '5a422a851b54a006234d17f1', username: 'root', name: 'root', passwordHash: await bcrypt.hash('passwordroot', 10) },
    { _id: '5a422a851b54a006234d17f2', username: 'foobar1', name: 'Test User1', passwordHash: await bcrypt.hash('password1', 10) },
    { _id: '5a422a851b54a006234d17f3', username: 'foobar2', name: 'Test User2', passwordHash: await bcrypt.hash('password2', 10) },
    { _id: '5a422a851b54a006234d17f4', username: 'foobar3', name: 'Test User3', passwordHash: await bcrypt.hash('password3', 10) }
  ]

  const userObjects = initialUsers.map(user => new User(user))
  const promiseArray = userObjects.map(user => user.save())
  await Promise.all(promiseArray)
})

afterAll(() => {
  mongoose.connection.close()
})

describe('user API - GET /', () => {
  test('users are returned as json', async () => {
    await api
      .get(`${BASE_PATH}/`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all users are returned', async () => {
    const response = await api.get(`${BASE_PATH}/`)

    expect(response.body).toHaveLength(initialUsers.length)
  })
})

describe('user API - POST /', () => {
  test('successfully creates a new user', async () => {
    const newUser = {
      username: 'test',
      name: 'Test User',
      password: 'password123',
    }

    const postResponse = await api.post(`${BASE_PATH}/`).send(newUser)
    expect(postResponse.status).toBe(200)
    expect(postResponse.header['content-type']).toMatch(/application\/json/)
    expect(postResponse.body.id).toBeDefined()

    const response = await api.get(`${BASE_PATH}/`)
    expect(response.body).toHaveLength(initialUsers.length + 1)
  })
})