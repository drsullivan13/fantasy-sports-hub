import './App.css'
import React, { useEffect, useState } from 'react'
// import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell, LabelList } from 'recharts'
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material' 
import { orderBy } from 'lodash'
import { DataGrid } from '@mui/x-data-grid';


function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [week, setWeek] = React.useState(1)
  const [year, setYear] = React.useState('2023')

  const columns = [
    { field: 'teamName', headerName: 'Team Name', minWidth: 200, flex: 1 },
    { field: 'freedomPoints', headerName: 'Freedom Points', minWidth: 125, flex: 0.5 },
  ]

  const handleWeekChange = (event) => {
    setWeek(event.target.value)
  }

  const handleYearChange = (event) => {
    setYear(event.target.value)
  }

  useEffect(() => {
    if(week !== undefined)
      fetchData(year, week)
  }, [week, year])

  const fetchData = (year, week) => {
    setLoading(true)
    let path
    path = week === 'Freedom' ? `/results/freedomStandings/${year}` : `/results/teamLeaderboard/${year}/${week}`
    fetch(path)
    .then((res) => res.json())
    .then((data) => {
      const orderedData = orderBy(data.data, ['freedomPoints'], ['desc'])
      console.log(`THIS IS THE DATA: ${JSON.stringify(orderedData)}`)

      // const rows: GridRowsProp = [
      //   { id: 1, col1: 'Hello', col2: 'World' },
      //   { id: 2, col1: 'DataGridPro', col2: 'is Awesome' },
      //   { id: 3, col1: 'MUI', col2: 'is Amazing' },
      // ];
      

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
  // const chart = (
  //   <BarChart width={1000} height={750} data={data} layout='horizontal'>
  //     <CartesianGrid strokeDasharray="3 3" />
  //     <YAxis type="number" domain={[0, 85]} />
  //     <XAxis type="category" dataKey="teamName" interval={0} minTickGap={20}/>
  //     <Tooltip formatter={(value, name, props) => tooltipFormatter(value, name, props)} labelFormatter={(value, name, props) => name[0]?.payload.teamName} />
  //     <Bar dataKey="freedomPoints">
  //       <LabelList fill='#000000' fontWeight='bold' dataKey="freedomPoints" position="right" />
  //     { data?.map((entry, index) => (<Cell key={`cell-${index}`} fill={percentageToColor((index+1)*10)} />)) }
  //     </Bar>
  //   </BarChart>
  // )

  const chart = (
    <DataGrid autoHeight rows={data} columns={columns} hideFooter={true} sx={{
      '& .MuiDataGrid-columnHeaderTitle': {
          textOverflow: "clip",
          whiteSpace: "break-spaces",
          lineHeight: 1
      }}}
      />
  )

  const yearDropDown = (
    <FormControl sx={{ m: 1, minWidth: 120 }}>
      <InputLabel id="demo-simple-select-helper-label">Year</InputLabel>
      <Select
        labelId="demo-simple-select-helper-label"
        id="demo-simple-select-helper"
        value={year}
        label="Year"
        onChange={handleYearChange}
      >
        <MenuItem value='Freedom'>Freedom</MenuItem>
        <MenuItem value='2021'>2021</MenuItem>
        <MenuItem value='2022'>2022</MenuItem>
        <MenuItem value='2023'>2023</MenuItem>
      </Select>
    </FormControl>
)

  // todo want this to auto populate items based on what comes back from the year selected
  const weekDropDown = (
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="demo-simple-select-helper-label">Week</InputLabel>
          <Select
            labelId="demo-simple-select-helper-label"
            id="demo-simple-select-helper"
            value={week}
            label="Week"
            onChange={handleWeekChange}
          >
            <MenuItem value='Freedom'>Freedom</MenuItem>
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={3}>3</MenuItem>
          </Select>
        </FormControl>
  )

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      <div className="App-header">
          <h1 style={{ textAlign: 'center' }}>THE Fantasy Sports Hub</h1>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div className="Week-dropdown">
              { yearDropDown }
            </div>
            <div className="Week-dropdown">
              { weekDropDown }
            </div>
          </div>          
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
