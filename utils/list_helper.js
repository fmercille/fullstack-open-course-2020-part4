const _ = require('lodash')

const dummy = (/*blogs*/) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0 || blogs === null) {
    return null
  }

  const favoriteBlog = blogs.reduce((fav, blog) => {
    if (blog.likes === fav.likes) {
      return (blog.title < fav.title ? blog : fav)
    } else {
      return (blog.likes > fav.likes ? blog : fav)
    }
  }, blogs[0])

  return favoriteBlog
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0 || blogs === null) {
    return null
  }

  const blogsByAuthors = _.countBy(blogs, 'author')
  const reducer = (result, value, key) => {
    if (result['blogs'] === value) {
      return (result['author'] < key ? result : { 'author': key, 'blogs': value })
    } else {
      return (result['blogs'] < value ? { 'author': key, 'blogs': value } : result)
    }
  }

  return _.reduce(blogsByAuthors, reducer, { 'author': '', 'blogs': -1 })
}

module.exports = {
  dummy,
  favoriteBlog,
  mostBlogs,
  totalLikes
}