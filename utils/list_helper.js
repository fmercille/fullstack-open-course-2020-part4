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

module.exports = {
  dummy,
  favoriteBlog,
  totalLikes
}