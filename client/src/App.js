import './App.css'
import React, { useEffect, useState } from 'react'
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Cell } from 'recharts'

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

  const getFill = (entry, index, third) => {
    console.log('STUFF', entry, index, third)
    return "#8884d8"
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

  const percentageToColor = (perc) => {
    console.log('yup', perc)
    var r, g, b = 0;
    if(perc < 50) {
      r = 255;
      g = Math.round(5.1 * perc);
    }
    else {
      g = 255;
      r = Math.round(510 - 5.10 * perc);
    }
    var h = r * 0x10000 + g * 0x100 + b * 0x1;
    return '#' + ('000000' + h.toString(16)).slice(-6);
  }
  

  const chart = (
    <BarChart width={1200} height={500} data={data} layout="horizontal">
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="abbreviation" interval={0} minTickGap={20} />
      <YAxis type="number" domain={[50, 175]}/>
      <Tooltip labelFormatter={(value, name, props) => name[0]?.payload.teamName} />
      <Legend />
      <Bar dataKey="score">
      { data?.map((entry, index) => (<Cell key={`cell-${index}`} fill={percentageToColor((index+1)*10)} />)) }
      </Bar>
    </BarChart>
  )

  //JSON.stringify(data, null, 2)

    return (
        <div className="App-header">
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
