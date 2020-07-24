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

afterAll(() => {
  mongoose.connection.close()
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

  test('blog created with no likes defaults to zero', async () => {
    const newBlog = {
      title: 'My Awesome Blog',
      author: 'John McFoobar',
      url: 'https://www.example.net/blog',
    }

    const postResponse = await api.post(`${BASE_PATH}/`).send(newBlog)
    const blogs = await helper.blogsInDb()
    expect(blogs).toContainEqual({ id: postResponse.body.id, likes: 0, ...newBlog })
  })

  test('blog created with missing title fails', async () => {
    const newBlog = {
      author: 'John McFoobar',
      url: 'https://www.example.net/blog',
      likes: 9001
    }

    await api.post(`${BASE_PATH}/`)
      .send(newBlog)
      .expect(400)
  })

  test('blog created with missing url fails', async () => {
    const newBlog = {
      title: 'My Awesome Blog',
      author: 'John McFoobar',
      likes: 9001
    }

    await api.post(`${BASE_PATH}/`)
      .send(newBlog)
      .expect(400)
  })
})

describe('blog API - DELETE /:id', () => {
  test('Delete a non existing blog returns nothing', async () => {
    const id = await helper.nonExistingId()
    await api.delete(`${BASE_PATH}/${id}`)
      .expect(204)
  })

  test('Delete a blog removes it from the list and returns it', async () => {
    const blogsInDbBefore = await helper.blogsInDb()
    const blogToRemove = blogsInDbBefore[0]
    const deleteResponse = await api.delete(`${BASE_PATH}/${blogToRemove.id}`)
    expect(deleteResponse.status).toBe(200)
    expect(deleteResponse.header['content-type']).toMatch(/application\/json/)
    expect(deleteResponse.body).toEqual(blogToRemove)
    const blogsInDbAfter = await helper.blogsInDb()
    expect(blogsInDbAfter).not.toContainEqual(blogToRemove)
    expect(blogsInDbAfter).toHaveLength(blogsInDbBefore.length - 1)
  })
})

describe('blog API - PUT /:id', () => {
  test('Update a non existing blog fails', async () => {
    const id = await helper.nonExistingId()
    const blogToUpdate = {
      title: 'Does not exist',
      url: 'http://localhost',
      author: 'Nobody',
      likes: 3
    }
    await api.put(`${BASE_PATH}/${id}`)
      .send(blogToUpdate)
      .expect(404)
  })

  test('Update an existing blog updates it', async () => {
    const blogsInDbBefore = await helper.blogsInDb()
    const blogToUpdate = blogsInDbBefore[0]
    blogToUpdate.likes = 3
    const response = await api.put(`${BASE_PATH}/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.likes).toBe(3)
    const blogsInDbAfter = await helper.blogsInDb()
    expect(blogsInDbAfter).toContainEqual(blogToUpdate)
  })
})
