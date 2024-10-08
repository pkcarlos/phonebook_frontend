import axios from 'axios'
const url = 'http://localhost:3001/api/persons'

const getAll = () => {
  const request = axios.get(url)
  return request.then(response => response.data)
}

const add = (newContact) => {
  const request = axios.post(url, newContact)
  return request.then(response => response.data)
}

const remove = (id) => {
  axios.delete(url + `/${id}`)
}

const updateNum = (id, newContact) => {
  const contactUrl = url + `/${id}`
  const request = axios.put(contactUrl, newContact)
  return request.then(response => response.data)
}

export default { getAll, add, remove, updateNum }