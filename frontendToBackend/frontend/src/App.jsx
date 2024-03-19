import { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios'

function App() {
  const [jokes, setjokes] = useState([])

  useEffect(()=>{
    axios.get('/api/jokes')
    .then((response)=>{
      setjokes(response.data)
    })
    .catch((error)=>{
      console.log(error)
    })
  })

  return (
    <>
      <h1>Hello This is Jeevendra Singh</h1>
      <p>Jokes: {jokes.length}</p>
      {
        jokes.map((joke)=>(
          <div key={joke.id}>
            <h2>{joke.title}</h2>
            <h3>{joke.content}</h3>
          </div>
        ))
      }
    </>
  )
}

export default App
