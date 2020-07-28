const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  { _id: '5a422a851b54a676234d17f7', title: 'React patterns', author: 'Michael Chan', likes: 7, url: 'https://reactpatterns.com/', 'user': '5a422a851b54a006234d17f3', __v: 0 },
  { _id: '5a422aa71b54a676234d17f8', title: 'Go To Statement Considered Harmful', author: 'Edsger W. Dijkstra', likes: 5, url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html', 'user': '5a422a851b54a006234d17f3', __v: 0 },
  { _id: '5a422b3a1b54a676234d17f9', title: 'Canonical string reduction', author: 'Edsger W. Dijkstra', likes: 12, url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html', 'user': '5a422a851b54a006234d17f3', __v: 0 },
  { _id: '5a422b891b54a676234d17fa', title: 'First class tests', author: 'Robert C. Martin', likes: 10, url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll', 'user': '5a422a851b54a006234d17f3', __v: 0 },
  { _id: '5a422ba71b54a676234d17fb', title: 'TDD harms architecture', author: 'Robert C. Martin', likes: 0, url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html', 'user': '5a422a851b54a006234d17f2', __v: 0 },
  { _id: '5a422bc61b54a676234d17fc', title: 'Type wars', author: 'Robert C. Martin', likes: 2, url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html', 'user': '5a422a851b54a006234d17f2', __v: 0 }
]

const initialUsers = [
  { _id: '5a422a851b54a006234d17f1', username: 'root', name: 'root', passwordHash: '$2b$10$slkd/wn/Ma4.UYG6oiU67.m8gDZr9xZ0QoggBOOROwz3rF25V9wQe', blogs: [] },          // password: passwordroot
  { _id: '5a422a851b54a006234d17f2', username: 'foobar1', name: 'Test User1', passwordHash: '$2b$10$apPRAFB4nmVYzwv0hy11C.KHl3EPl1Fo9HS3dIqklTcttew36R20G', blogs: ['5a422ba71b54a676234d17fb', '5a422bc61b54a676234d17fc'] }, // password: password1
  { _id: '5a422a851b54a006234d17f3', username: 'foobar2', name: 'Test User2', passwordHash: '$2b$10$BukyPCpuDMzLB6hPk9zqre8pV4NXDdcCCt6J392u8NyOYHZjFDXQS', blogs: ['5a422a851b54a676234d17f7', '5a422aa71b54a676234d17f8', '5a422b3a1b54a676234d17f9', '5a422b891b54a676234d17fa'] }, // password: password2
  { _id: '5a422a851b54a006234d17f4', username: 'foobar3', name: 'Test User3', passwordHash: '$2b$10$pXkjQzOUWXSxWZE8I9YD6OWiZ36IZhvd5M2rNyY.DQElSQX9CihFS', blogs: [] }  // password: password3
]

const nonExistingId = async () => {
  const blog = new Blog({ title: 'willremovethissoon', author: 'nobody', likes: 0, url: 'none' })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

const populateUsersAndBlogs = async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const blogObjects = initialBlogs.map(blog => new Blog(blog))
  const userObjects = initialUsers.map(user => new User(user))
  const promiseArray = blogObjects.map(blog => blog.save()).concat(userObjects.map(user => user.save()))
  return Promise.all(promiseArray)
}

module.exports = {
  initialBlogs,
  initialUsers,
  nonExistingId,
  blogsInDb,
  usersInDb,
  populateUsersAndBlogs
}