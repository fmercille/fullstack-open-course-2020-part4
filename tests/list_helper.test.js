const listHelper = require('../utils/list_helper')

const listWithOneBlog = [
  { _id: '5a422aa71b54a676234d17f8', title: 'Go To Statement Considered Harmful', author: 'Edsger W. Dijkstra', likes: 5, url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html', __v: 0 }
]

const listWithManyBlogs = [
  { _id: '5a422a851b54a676234d17f7', title: 'React patterns',                     author: 'Michael Chan',       likes: 7,  url: 'https://reactpatterns.com/', __v: 0 },
  { _id: '5a422aa71b54a676234d17f8', title: 'Go To Statement Considered Harmful', author: 'Edsger W. Dijkstra', likes: 5,  url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html', __v: 0 },
  { _id: '5a422b3a1b54a676234d17f9', title: 'Canonical string reduction',         author: 'Edsger W. Dijkstra', likes: 12, url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html', __v: 0 },
  { _id: '5a422b891b54a676234d17fa', title: 'First class tests',                  author: 'Robert C. Martin',   likes: 10, url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll', __v: 0 },
  { _id: '5a422ba71b54a676234d17fb', title: 'TDD harms architecture',             author: 'Robert C. Martin',   likes: 0,  url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html', __v: 0 },
  { _id: '5a422bc61b54a676234d17fc', title: 'Type wars',                          author: 'Robert C. Martin',   likes: 2,  url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html', __v: 0 }
]

test('dummy returns one', () => {
  const blogs = []
  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {
  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    expect(result).toBe(5)
  })

  test('when list has many blogs calculate correctly', () => {
    const result = listHelper.totalLikes(listWithManyBlogs)
    expect(result).toBe(36)
  })

  test('when list is empty returns zero', () => {
    const result = listHelper.totalLikes([])
    expect(result).toBe(0)
  })
})

describe('favorite blog', () => {
  test('when list is empty returns null', () => {
    const result = listHelper.favoriteBlog([])
    expect(result).toBeNull()
  })

  test('when list has only one blog returns that blog', () => {
    const result = listHelper.favoriteBlog(listWithOneBlog)
    expect(result).toEqual(listWithOneBlog[0])
  })

  test('when list has many blogs returns the most popular', () => {
    const result = listHelper.favoriteBlog(listWithManyBlogs)
    expect(result).toEqual(listWithManyBlogs[2])
  })

  const listWithManyBlogsWithEqualLikes = [
    { _id: '5a422a851b54a676234d17f7', title: 'React patterns',                     author: 'Michael Chan',       likes: 7,  url: 'https://reactpatterns.com/', __v: 0 },
    { _id: '5a422aa71b54a676234d17f8', title: 'Go To Statement Considered Harmful', author: 'Edsger W. Dijkstra', likes: 12, url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html', __v: 0 },
    { _id: '5a422b3a1b54a676234d17f9', title: 'Canonical string reduction',         author: 'Edsger W. Dijkstra', likes: 12, url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html', __v: 0 },
    { _id: '5a422b891b54a676234d17fa', title: 'First class tests',                  author: 'Robert C. Martin',   likes: 10, url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll', __v: 0 },
  ]

  test('when list has multiple blogs with same number of likes, return the first in alphabetical order of title', () => {
    const result = listHelper.favoriteBlog(listWithManyBlogs)
    expect(result).toEqual(listWithManyBlogs[2])
  })
})