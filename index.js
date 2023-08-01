require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const app = express()

app.use(express.json())
app.use(express.static('build'))
app.use(cors())

morgan.token('body', (request, response) => {
  return JSON.stringify(request.body)
})

morgan.token('ip', (request, response) => {
  return request.socket.remoteAddress
})

app.use(morgan(':method :url :status :res[content-length] - :ip - :response-time ms :body'))

app.get('/info', (request, response) => {
  const peopleLength = people.length
  const dateNow = new Date().toString()
  response.send(`<p>Phonebook has info for ${peopleLength} people</p>
                 <p>${dateNow}</p>`)
})

app.get('/api/people', (request, response) => {
  Person.find().then(foundPeople => {
    response.json(foundPeople)
  })
})

app.post('/api/people', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'data missing'
    })
  }

  if (people.find(person => person.name === body.name)) {
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * 1000000)
  }

  people = people.concat(person)
  response.json(person)
})

app.get('/api/people/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = people.find(person => person.id === id)
  
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/people/:id', (request, response) => {
  const id = Number(request.params.id)
  people = people.filter(person => person.id !== id)
  
  response.status(204).end()
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})