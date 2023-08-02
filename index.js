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


app.get('/info', (request, response, next) => {
  Person.find()
    .then(foundPeople => {
      const peopleLength = foundPeople.length
      const dateNow = new Date().toString()
      response.send(`<p>Phonebook has info for ${peopleLength} people</p>
                     <p>${dateNow}</p>`)
    })
    .catch(error => next(error))  
})

app.get('/api/people', (request, response, next) => {
  Person.find()
    .then(foundPeople => {
      response.json(foundPeople)
    })
    .catch(error => next(error))
})

app.post('/api/people', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'data missing'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })
  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.get('/api/people/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(foundPerson => {
      if(foundPerson) {
        response.json(foundPerson)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/people/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/people/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})


const errorHandler = (error, request, response, next) => {
  console.log(error)

  if (error.name === 'CastError') {
    return response.status(400).send({
      error: 'malformatted id'
    })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({
      error: error.message
    })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})