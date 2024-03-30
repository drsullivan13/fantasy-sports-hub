import './App.css'
import React from 'react'
import { Leaderboard } from './components';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


function App() {
  // const [data, setData] = useState(null)
  
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


    return (
      <Router>
        <Routes>
          {/* Route for football */}
          <Route path="/:leagueType/:leagueId" element={<Leaderboard/>} />

          {/* Route for baseball */}
          {/* <Route path="/baseball/:leagueId" component={BaseballComponent} /> */}
        </Routes>
      </Router>
    )
}

export default App;
