const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require ('../app')
const api = supertest(app)
const helper = require('./test_helper')
const User = require('../models/user')

const BASE_PATH = '/api/blogs'
const LOGIN_PATH = '/api/login'

beforeEach(async () => {
  await helper.populateUsersAndBlogs()
})

afterAll(() => {
  mongoose.connection.close()
})

const login = async () => {
  const credentials = {
    'username': 'foobar1',
    'password': 'password1'
  }

  const postResponse = await api.post(`${LOGIN_PATH}/`).send(credentials)
  const token = postResponse.body.token
  const userObject = (await User.find({ 'username': credentials.username }))[0]
  const user = { id: String(userObject._id), name: userObject.name, username: userObject.username }
  return { token, user }
}

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

    const { token, user } = await login()
    const userBlogsBefore = (await User.findById(user.id)).blogs
    const postResponse = await api.post(`${BASE_PATH}/`).set('Authorization', `Bearer ${token}`).send(newBlog)
    expect(postResponse.status).toBe(201)
    expect(postResponse.header['content-type']).toMatch(/application\/json/)
    expect(postResponse.body.id).toBeDefined()

    const response = await api.get(`${BASE_PATH}/`)
    expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
    expect(response.body).toContainEqual({ id: postResponse.body.id, user, ...newBlog })

    // Ensure that the new blog was also linked in the user collection
    const userBlogsAfter = (await User.findById(user.id)).blogs
    expect(userBlogsAfter.length).toBe(userBlogsBefore.length + 1)
  })

  test('blog created with no likes defaults to zero', async () => {
    const newBlog = {
      title: 'My Awesome Blog',
      author: 'John McFoobar',
      url: 'https://www.example.net/blog',
    }

    const { token, user } = await login()
    const postResponse = await api.post(`${BASE_PATH}/`).set('Authorization', `Bearer ${token}`).send(newBlog)
    const blogs = await helper.blogsInDb()

    expect(blogs).toContainEqual({ id: postResponse.body.id, user: mongoose.Types.ObjectId(user.id), likes: 0, ...newBlog })
  })

  test('create new blog without login fails', async () => {
    const newBlog = {
      title: 'My Awesome Blog',
      author: 'John McFoobar',
      url: 'https://www.example.net/blog',
      likes: 9001
    }

    const postResponse = await api.post(`${BASE_PATH}/`).send(newBlog)
    expect(postResponse.status).toBe(401)
    expect(postResponse.header['content-type']).toMatch(/application\/json/)
    expect(postResponse.body.error).toBeDefined()
  })

  test('blog created with missing title fails', async () => {
    const newBlog = {
      author: 'John McFoobar',
      url: 'https://www.example.net/blog',
      likes: 9001
    }

    const { token } = await login()
    await api.post(`${BASE_PATH}/`)
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
  })

  test('blog created with missing url fails', async () => {
    const newBlog = {
      title: 'My Awesome Blog',
      author: 'John McFoobar',
      likes: 9001
    }

    const { token } = await login()
    await api.post(`${BASE_PATH}/`)
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
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
    let { user, ...expectedObject } = blogToRemove // Removing the user reference because the array of models doesn't expand it how we would expect
    expect(deleteResponse.body).toMatchObject(expectedObject)
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
