import { useEffect, useState } from 'react'
import { getItineraries } from '../services/itineraryService'

function ItineraryPage() {
  const [itineraries, setItineraries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getItineraries()
      .then(setItineraries)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading itineraries...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <main>
      <h1>Itineraries</h1>
      {itineraries.length === 0 ? (
        <p>No itineraries found.</p>
      ) : (
        <ul>
          {itineraries.map((item) => (
            <li key={item.id}>
              <strong>{item.title}</strong> — {item.destination}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default ItineraryPage
