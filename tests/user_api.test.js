const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')

const BASE_PATH = '/api/users'

beforeEach(async () => {
  await helper.populateUsersAndBlogs()
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

    expect(response.body).toHaveLength(helper.initialUsers.length)
  })
})

describe('user API - POST /', () => {
  test('successfully creates a new user', async () => {
    const newUser = {
      username: 'test',
      name: 'Test User',
      password: 'password123',
    }

    const userCountBefore = (await helper.usersInDb()).length
    const postResponse = await api.post(`${BASE_PATH}/`).send(newUser)
    expect(postResponse.status).toBe(200)
    expect(postResponse.header['content-type']).toMatch(/application\/json/)
    expect(postResponse.body.id).toBeDefined()
    const userCountAfter = (await helper.usersInDb()).length
    expect(userCountAfter).toBe(userCountBefore+1)
  })

  test('create user without password fails', async () => {
    const newUser = {
      username: 'test',
      name: 'Test User',
    }

    const postResponse = await api.post(`${BASE_PATH}/`).send(newUser)
    expect(postResponse.status).toBe(400)
    expect(postResponse.body).toHaveProperty('error')
    expect(postResponse.body.error).toMatch(/password/i)
  })

  test('create user without username fails', async () => {
    const newUser = {
      name: 'Test User',
      password: 'password123',
    }

    const postResponse = await api.post(`${BASE_PATH}/`).send(newUser)
    expect(postResponse.status).toBe(400)
    expect(postResponse.body).toHaveProperty('error')
    expect(postResponse.body.error).toMatch(/username/i)
  })

  test('create user without name fails', async () => {
    const newUser = {
      username: 'test',
      password: 'password123',
    }

    const postResponse = await api.post(`${BASE_PATH}/`).send(newUser)
    expect(postResponse.status).toBe(400)
    expect(postResponse.body).toHaveProperty('error')
    expect(postResponse.body.error).toMatch(/name/i)
  })

  test('create user with existing username fails', async () => {
    const newUser = {
      username: helper.initialUsers[1].username,
      name: 'Test User',
      password: 'password123',
    }

    const postResponse = await api.post(`${BASE_PATH}/`).send(newUser)
    expect(postResponse.status).toBe(400)
    expect(postResponse.body).toHaveProperty('error')
    expect(postResponse.body.error).toMatch(/username/i)
  })

  test('create user with password too short fails', async () => {
    const newUser = {
      username: 'test',
      name: 'Test User',
      password: 'a',
    }

    const postResponse = await api.post(`${BASE_PATH}/`).send(newUser)
    expect(postResponse.status).toBe(400)
    expect(postResponse.body).toHaveProperty('error')
    expect(postResponse.body.error).toMatch(/password/i)
  })
})