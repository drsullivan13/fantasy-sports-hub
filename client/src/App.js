import './App.css'
import React, { useEffect, useState } from 'react'
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell, LabelList } from 'recharts'
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material' 
import { orderBy } from 'lodash'

function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [week, setWeek] = React.useState(1)

  const handleChange = (event) => {
    setWeek(event.target.value)
  }

  useEffect(() => {
    if(week !== undefined)
      fetchData(week)
  }, [week])

  const fetchData = (week) => {
    setLoading(true)
    let path
    path = week === 'Freedom' ? `/results/freedomStandings` : `/results/teamLeaderboard/${week}`
    fetch(path)
    .then((res) => res.json())
    .then((data) => {
      const orderedData = orderBy(data.data, ['freedomPoints'], ['asc'])
      console.log(`THIS IS THE DATA: ${JSON.stringify(orderedData)}`)
      setData(orderedData)
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
   * add drop down for season year so can cycle back to previous years
   * 
   * store freedom points in table
   * could even store these in a dynamo table so can fast search them later
   * think about the cassandra db or something like that
   * 
   * have in the drop down the accumulte one
   * 
   * want to create navigation system
   * LANDING PAGE 
   *  - go to league page
   *  - individual teams page
   *  - league matchups page
   * 
   * todo how to reload just the chart component and not move the drop down
   * 
   * https://gist.github.com/rmiyazaki6499/b564b40e306707c8ff6ca9c67d38fb6f?permalink_comment_id=3846281
   * ^example of how to deploy to AWS and EC2
   */

  //todo clean this
  const percentageToColor = (perc) => {
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

  const tooltipFormatter = (value, name, props) => {
    return [JSON.stringify({ score: value, freedomPoints: props?.payload?.freedomPoints }), 'Result']
  }
  
  //todo probably will want just a diff chart actually depending on if the week is a standard week or freedom
  const chart = (
    <BarChart width={1000} height={750} data={data} layout="vertical">
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis type="number" domain={[0, 85]} />
      <YAxis type="category" dataKey="teamName" interval={0} minTickGap={20}/> // todo have this switch based on drop down
      <Tooltip formatter={(value, name, props) => tooltipFormatter(value, name, props)} labelFormatter={(value, name, props) => name[0]?.payload.teamName} />
      {/* <Legend /> */}
      <Bar dataKey="freedomPoints">
        <LabelList fill='#000000' fontWeight='bold' dataKey="freedomPoints" position="right" /> // todo have this switch on drop down
      { data?.map((entry, index) => (<Cell key={`cell-${index}`} fill={percentageToColor((index+1)*10)} />)) }
      </Bar>
    </BarChart>
  )

  const weekDropDown = (
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="demo-simple-select-helper-label">Week</InputLabel>
          <Select
            labelId="demo-simple-select-helper-label"
            id="demo-simple-select-helper"
            value={week}
            label="Week"
            onChange={handleChange}
          >
            <MenuItem value='Freedom'>Freedom</MenuItem>
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={3}>3</MenuItem>
          </Select>
        </FormControl>
  )

    return (
      <div style={{ display: 'flex' }}>
        <div className="Week-dropdown">
          { weekDropDown }
        </div>
      <div className="App-header">
          <h1>Welcome to The Fantasy Sports Hub</h1>
          <>
          <pre>
            {loading ? "Loading..." : chart}
          </pre>
          </>
        </div>
      </div>
       
    )
}

export default App;
