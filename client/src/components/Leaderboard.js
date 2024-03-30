import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const freedomColumns = [
    { field: 'teamName', headerName: 'Team Name', minWidth: 200, flex: 1 },
    { field: 'freedomPoints', headerName: 'Total Freedom Points', minWidth: 125, flex: 0.5 },
  ]
  
  const weeklyFreedomColumns = [
    { field: 'teamName', headerName: 'Team Name', minWidth: 200, flex: 1 },
    { field: 'weekFreedomPoints', headerName: 'Weekly Points', minWidth: 125, flex: 0.5 },
    { field: 'freedomPoints', headerName: 'Total Freedom Points', minWidth: 125, flex: 0.5 },
  ]

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

export const Leaderboard = () => {
  const { leagueType, leagueId } = useParams()
  const [loading, setLoading] = useState(true)
  const [week, setWeek] = useState('Freedom')
  const [year, setYear] = useState('2023')
  const [freedomStandings, setFreedomStandings] = useState({})
  const [weeklyStandings, setWeeklyStandings] = useState(null)
  const [haveFetchedData, setHaveFetchedData] = useState(false)
  const [chartRows, setChartRows] = useState([])
  const [columns, setColumns] = useState(freedomColumns)

  const handleWeekChange = (event) => {
    setWeek(event.target.value)
    const newRows = []
    if (event.target.value === 'Freedom') {
      setColumns(freedomColumns)
      Object.keys(freedomStandings).forEach((teamName, index) => {
        newRows.push({ id: index, teamName, freedomPoints: freedomStandings[teamName] })
      })
    } else {
      setColumns(weeklyFreedomColumns)
      const givenWeekFreedomPoints = weeklyStandings[event.target.value-1]

      Object.keys(givenWeekFreedomPoints).forEach((teamName, index) => {
        newRows.push({ id: index, teamName, weekFreedomPoints: givenWeekFreedomPoints[teamName].freedomPointsInWeek, freedomPoints: givenWeekFreedomPoints[teamName].totalFreedomPointsThroughWeek })
      })
    }

    // console.log(`NEW ROWS: ${JSON.stringify(newRows)}`)
    setChartRows(newRows)
  }

  const handleYearChange = (event) => {
    setYear(event.target.value)
  }

  useEffect(() => {
    if(week !== undefined && !haveFetchedData) {
      // only want to fetch weeks on initial load and if there is a year change
      Promise.all([fetchData(year, week), fetchWeeks()])
    }
  }, [week, year, haveFetchedData])

  const fetchData = async (year, week) => {
    setLoading(true)
    let path
    // `https://fantasy-sports-hub-api.vercel.app/results/freedomStandings/${year}` : `https://fantasy-sports-hub-api.vercel.app/results/teamLeaderboard/${year}/${week}`
    // path = week === 'Freedom' ? `http://localhost:5001/results/${leagueType}/${leagueId}/freedomStandings/${year}` : `http://localhost:5001/results/teamLeaderboard/${year}/${week}`
    path = week === 'Freedom' ? `https://fantasy-sports-hub-api.vercel.app/results/${leagueType}/${leagueId}/freedomStandings/${year}` : `https://fantasy-sports-hub-api.vercel.app/results/${leagueType}/${leagueId}/teamLeaderboard/${year}/${week}`
    fetch(path)
    .then((res) => res.json())
    .then((data) => {
      setFreedomStandings(data.data.freedomPoints)
      setWeeklyStandings(data.data.weeklyFreedomPoints)

      const newRows = []
      Object.keys(data.data.freedomPoints).forEach((teamName, index) => {
        newRows.push({ id: index, teamName, freedomPoints: data.data.freedomPoints[teamName] })
      })
      setChartRows(newRows)
      setColumns(freedomColumns)
      setLoading(false)
      setHaveFetchedData(true)
    })
    .catch((error) => {
      console.log(`Error occurred fetching data`, error)
      setLoading(false)
    })
  }

  const chart = () => {
    return (
      <DataGrid autoHeight rows={chartRows} columns={columns} hideFooter={true} sx={{
        '& .MuiDataGrid-columnHeaderTitle': {
            textOverflow: "clip",
            whiteSpace: "break-spaces",
            lineHeight: 1
        }}}
        initialState={{
          sorting: { sortModel: [{ field:'freedomPoints', sort: 'desc' }] }
        }}
        />
    )
  }

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
            <MenuItem value={4}>4</MenuItem>
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={6}>6</MenuItem>
            <MenuItem value={7}>7</MenuItem>
            <MenuItem value={8}>8</MenuItem>
            <MenuItem value={9}>9</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={11}>11</MenuItem>
            <MenuItem value={12}>12</MenuItem>
            <MenuItem value={13}>13</MenuItem>
            <MenuItem value={14}>14</MenuItem>
          </Select>
        </FormControl>
  )

  const fetchWeeks = async () => {
    return ''
  }


    return  (
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
              {loading ? "Loading..." : chart()}
            </pre>
            </>
          </div>
        </div>
         
      )
}