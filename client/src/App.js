import './App.css';
import React, { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = () => {
    setLoading(true)
    fetch("/results/1")
    .then((res) => res.json())
    .then((data) => {
      setData(data.data)
      setLoading(false)
    })
    .catch((error) => {
      console.log(`Error occurred fetching data`, error)
      setLoading(false)
    })
  }
  /**
   * todo
   * create drop down to cycle through the matchups
   * create a menu bar that can cycle through the weeks
   * 
   * want to create navigation system
   * LANDING PAGE 
   *  - go to league page
   *  - individual teams page
   *  - league matchups page
   */

    return (
        <div>
          <h1>Welcome to The Fantasy Sports Hub</h1>
          <>
          <pre>
            {loading ? "Loading..." : JSON.stringify(data, null, 2)}
          </pre>
          </>
        </div>
    )
}

export default App;
