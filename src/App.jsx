import { useState, useEffect } from 'react'
import contactService from './services/contacts'
import Notification from './components/Notification'

const Display = (props) => {
  const { persons, names, filter, changePersons } = props

  const handleDelete = (event) => {
    const id = event.target.id
    console.log('persons', persons)
    const name = persons.find(person => person.id === id).name //// error here

    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      contactService
      .remove(id)
    
      changePersons(persons.filter(person => person.id !== id))
    }
  }

  const showAll = () => {
    let html = []
    const numbers = persons.map((person) => person.number)

    for (let i = 0; i < names.length; i ++) {
      const id = persons.find(person => person.name === names[i]).id

      html = html.concat(<p key={i}>{names[i]} {numbers[i]} <button onClick={handleDelete} id={id}>delete</button></p>)
    }

    return html
  }

  const showFiltered = (filter) => {
    let html = []
    let filtered = persons.filter((person) => person.name.toLowerCase().includes(filter.toLowerCase()))

    for (let i = 0; i < filtered.length; i ++) {
      const id = filtered[i].id

      html = html.concat(<p key={i}>{filtered[i].name} {filtered[i].number} <button onClick={handleDelete} id={id}>delete</button></p>)
    }

    return html
  }

  if (filter !== '') {
    return showFiltered(filter)
  } else {
    return showAll()
  }
}

const PersonForm = (props) => {
  const { newName, newNumber, handleNumInput, handleNameInput, handleClick } = props

  return (
    <form>
      <div>
        name: <input type='text' value={newName} onChange={handleNameInput} />
      </div>
      <div>
        number: <input type='text' value={newNumber} onChange={handleNumInput} />
      </div>
      <div>
        <button type="submit" onClick={handleClick}>add</button>
      </div>
   </form>    
  )
}

const Filter = (props) => {
  const { filter, handleFilter} = props

  return (
    <div>
      Filter with <input type='text' value={filter} onChange={handleFilter} />
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    contactService
      .getAll()
      .then(response => {
        setPersons(response)
      })
  }, [])

  const names = persons.map((person) => person.name)

  const handleNameInputChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumInputChange = (event) => {
    setNewNumber(event.target.value)
  }
  
  const handleFilterInputChange = (event) => setFilter(event.target.value)

  const handleClick = (event) => {
    event.preventDefault()

    const newContact = { name: newName, number: newNumber }

    // prevent duplicate additions
    if (names.includes(newName)) {
      if (window.confirm(`${newName} is already added to the phonebook. Replace the old number with a new one?`)) {
        // replace old number with new number
        const id = persons.find(person => person.name === newName).id
        
        contactService
          .updateNum(id, newContact)
          .then(() => {
            setSuccessMessage(`The phone number for ${newName} has been successfully changed.`)

            setTimeout(() => {
              setSuccessMessage(null)
            }, 5000)

            setPersons(persons.map(person => {
              if (person.name === newName) {
                person.number = newNumber
              }

              return person
            }))

            setNewName('')
            setNewNumber('')
          })
      }
    } else { // post to db
      contactService
        .add(newContact)
        .then(response => {
          setSuccessMessage(`${newName} has been successfully added.`)

          setTimeout(() => {
            setSuccessMessage(null)
          }, 5000)

          setPersons(persons.concat([response]))
          setNewName('')
          setNewNumber('')
        })
        .catch(error => {
          setErrorMessage(error.response.data.error)

          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
        })
    }
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={successMessage} />
      <Notification message={errorMessage} />

      <Filter filter={filter} handleFilter={handleFilterInputChange} />

      <h3>Add New Contact</h3>

      <PersonForm 
        newName={newName} newNumber={newNumber} handleNumInput={handleNumInputChange} handleNameInput={handleNameInputChange} handleClick={handleClick} 
      />

      <h3>Numbers</h3>

      <Display persons={persons} names={names} filter={filter} changePersons={setPersons} />
    </div>
  )
}

export default App