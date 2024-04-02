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
  const [year, setYear] = useState('2024')
  const [weeks, setWeeks] = useState(['Freedom'])
  const [years, setYears] = useState(['2024'])
  const [leagueInfo, setLeagueInfo] = useState({})
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

    setChartRows(newRows)
  }

  const handleYearChange = async (event) => {
    setYear(event.target.value)
    setWeeks(leagueInfo[event.target.value])
    await fetchData(event.target.value, 'Freedom')
    setWeek('Freedom')
  }

  useEffect(() => {
    if(week !== undefined && !haveFetchedData) {
      // only want to fetch weeks on initial load and if there is a year change
      Promise.all([fetchData(year, week), fetchLeagueInfo(leagueType, leagueId)])
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
    .then(({ data: { freedomPoints, weeklyFreedomPoints } }) => {
      setFreedomStandings(freedomPoints)
      setWeeklyStandings(weeklyFreedomPoints)

      const newRows = []
      Object.keys(freedomPoints).forEach((teamName, index) => {
        newRows.push({ id: index, teamName, freedomPoints: freedomPoints[teamName] })
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

  const yearDropDown = () => {
    return (
      <FormControl sx={{ m: 1, minWidth: 120 }}>
        <InputLabel id="demo-simple-select-helper-label">Year</InputLabel>
        <Select
          labelId="demo-simple-select-helper-label"
          id="demo-simple-select-helper"
          value={year}
          label="Year"
          onChange={handleYearChange}
        >

        {years.map((year) => (
          <MenuItem key={year} value={year}>
            {year}
          </MenuItem>
        ))}
        </Select>
      </FormControl>
    )
  }

  const weekMenuItems = () => {
    const menuItems = [
      <MenuItem key="Freedom" value="Freedom">
        Freedom
      </MenuItem>,
    ]

    for (let i = 1; i <= leagueInfo[year]; i++) {
      menuItems.push(
        <MenuItem key={`${i}`} value={`${i}`}>
          {`${i}`}
        </MenuItem>
      )
    }

    return menuItems
  }
  
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
        {weekMenuItems()}
      </Select>
    </FormControl>
  );

  const fetchLeagueInfo = async (leagueType, leagueId) => {
    // const path = `http://localhost:5001/leagueInfo?leagueType=${leagueType}&leagueId=${leagueId}`
    const path = `https://fantasy-sports-hub-api.vercel.app/leagueInfo?leagueType=${leagueType}&leagueId=${leagueId}`
    fetch(path)
    .then((res) => res.json())
    .then((data) => {
      console.log(`THIS IS THE DATA: ` + JSON.stringify(data))
      setYears(Object.keys(data.data))
      setLeagueInfo(data.data)
    })
  }

    return  (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <div className="App-header">
            <h1 style={{ textAlign: 'center' }}>THE Fantasy Sports Hub</h1>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <div className="Week-dropdown">
                { yearDropDown() }
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