import api from './apiClient'

export async function createUser(payload) {
  const { data } = await api.post('/users/', payload)
  return data
}

export async function getUser(id) {
  const { data } = await api.get(`/users/${id}`)
  return data
}
