import axios from 'axios'
import { stringify } from './util'

const baseUrl = 'https://fantasy.espn.com/apis/v3/games/ffl/seasons'

const leagueId = '248873'

// const cookie = 'espn_s2=AEBNiyj2iDnjuTXVAfbzp1pJYeiACmmgU6Wq7sVi%2FR6PadoeiBqbyO1DH59pPiFrj2j46fyrAz6QglTFRfdv6UdBcilVsEz7qoLmze5cFbAyZzlbf0DnO2j1WBEUnvsKegjCpZwn93Epo0eIuwaXD108Q5mCzmRFjAsMLlAaRhTEvVsq7NOiRQUje7vatEUkn1t5OtKkwpAJSRao1Hp5ngbbM%2Flb1%2F3cKaozUeJ%2BSuJ5q9CBCSbb7j3vBvmxk2jX8I2KUv5jGorqKgBVi6LtJbOKMuPo4XBH3gB%2BdEoMiKhnHOB%2FYHshQA67slLdfDvyN%2BE%3D; SWID={A393ED4A-3AB9-47FF-8EDB-747983FB025A};'

const axiosInstance = axios.create({ withCredentials: true })

export const getMatchupResults = async (week, seasonId) => {
  const { data: { schedule } } = await axiosInstance.get(`${baseUrl}/${seasonId}/segments/0/leagues/${leagueId}?view=mMatchup&view=mMatchupScore&scoringPeriodId=${week}`,
    { withCredentials: true, headers: { cookie: 'espn_s2=AEB6eYtlqIgLDkLzrwf4LAS7KQwaliUFhzuOgsTduWE01%2FhOEbOKQFyeH%2F6gelPrp6Oxkxv00Cw1F1Us13PqoDaHJa4sPl8cLumbND2Kaitv%2BMYpZCYvk4eg53IzA5D8yi%2BbD%2Fk3a%2B8ARmGrOAkDqG71m75xzLzqhm4rvxeUdMftUAh2tTfBtfgTlAq3Uwcrf7yDlzaWyocJa5X4xrYoExKcxcZc%2BvuFI%2F3kROX2BRxjh30EP9QzjtUsaiufdXVY5Qqzqy96c8RPOR6hh5wSe5Ce%2FJXNufBg47j4ml8WizHMo73HIb4Vl%2BKQYIrK4yyE3PQ%3D; SWID={A393ED4A-3AB9-47FF-8EDB-747983FB025A};' } })

  // console.log('MATCHUP RESPONSE SCHEDULE', stringify(schedule))

  return schedule.filter((matchup) => matchup.matchupPeriodId === week)
}

export const getTeamInformation = async (seasonId) => {
  console.log(`URL: ${baseUrl}/${seasonId}/segments/0/leagues/${leagueId}?scoringPeriodId=1&view=mRoster&view=mTeam`)
  const { data: { teams } } = await axiosInstance.get(`${baseUrl}/${seasonId}/segments/0/leagues/${leagueId}?scoringPeriodId=1&view=mRoster&view=mTeam`,
    { withCredentials: true, headers: { cookie: 'espn_s2=AEBNiyj2iDnjuTXVAfbzp1pJYeiACmmgU6Wq7sVi%2FR6PadoeiBqbyO1DH59pPiFrj2j46fyrAz6QglTFRfdv6UdBcilVsEz7qoLmze5cFbAyZzlbf0DnO2j1WBEUnvsKegjCpZwn93Epo0eIuwaXD108Q5mCzmRFjAsMLlAaRhTEvVsq7NOiRQUje7vatEUkn1t5OtKkwpAJSRao1Hp5ngbbM%2Flb1%2F3cKaozUeJ%2BSuJ5q9CBCSbb7j3vBvmxk2jX8I2KUv5jGorqKgBVi6LtJbOKMuPo4XBH3gB%2BdEoMiKhnHOB%2FYHshQA67slLdfDvyN%2BE%3D; SWID={A393ED4A-3AB9-47FF-8EDB-747983FB025A};' } })
  return teams
}
