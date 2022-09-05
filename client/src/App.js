import './App.css'
import React, { useEffect, useState } from 'react'
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts'

function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = () => {
    setLoading(true)
    fetch("/results/teamLeaderboard/1")
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

  const chart = (
    <BarChart width={500} height={500} data={data} layout="horizontal">
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="teamName" />
      <YAxis type="number" domain={[0, 200]}/>
      <Tooltip />
      <Legend />
      <Bar dataKey="score" fill="#8884d8" />
    </BarChart>
  )

  //JSON.stringify(data, null, 2)

    return (
        <div>
          <h1>Welcome to The Fantasy Sports Hub</h1>
          <>
          <pre>
            {loading ? "Loading..." : chart}
          </pre>
          </>
        </div>
    )
}

export default App;
