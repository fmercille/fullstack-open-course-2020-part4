const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const blogs = await User.find({}).populate('blogs', { 'id': 1, 'title': 1, 'author': 1, 'url': 1, 'likes': 1 })
  response.json(blogs)
})

usersRouter.post('/', async (request, response) => {
  const body = request.body
  const saltRounds = 10

  if (!body.password) {
    response.status(400).json({ 'error': 'Password is mandatory' })
  }

  if (body.password.length < 3) {
    response.status(400).json({ 'error': 'Password is too short' })
  }

  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash
  })

  const savedUser = await user.save()
  response.json(savedUser)
})

module.exports = usersRouter