const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require ('../app')
const api = supertest(app)
const helper = require('./test_helper')
const Blog = require('../models/blog')

const BASE_PATH = '/api/blogs'

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

describe('blog API - GET /', () => {
  test('blogs are returned as json', async () => {
    await api
      .get(`${BASE_PATH}/`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get(`${BASE_PATH}/`)

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('unique identifier property is named id', async () => {
    const response = await api.get(`${BASE_PATH}/`)
    expect(response.body[0].id).toBeDefined()
  })
})

describe('blog API - POST /', () => {
  test('successfully creates a new blog', async () => {
    const newBlog = {
      title: 'My Awesome Blog',
      author: 'John McFoobar',
      url: 'https://www.example.net/blog',
      likes: 9001
    }

    const postResponse = await api.post(`${BASE_PATH}/`).send(newBlog)
    expect(postResponse.status).toBe(201)
    expect(postResponse.header['content-type']).toMatch(/application\/json/)
    expect(postResponse.body.id).toBeDefined()

    const response = await api.get(`${BASE_PATH}/`)
    expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
    expect(response.body).toContainEqual({ id: postResponse.body.id, ...newBlog })
  })
})

afterAll(() => {
  mongoose.connection.close()
})