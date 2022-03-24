import axios from 'axios'

const baseUrl = 'https://fantasy.espn.com/apis/v3/games/flb/seasons'

const cookie = 'espn_s2=AEBNiyj2iDnjuTXVAfbzp1pJYeiACmmgU6Wq7sVi%2FR6PadoeiBqbyO1DH59pPiFrj2j46fyrAz6QglTFRfdv6UdBcilVsEz7qoLmze5cFbAyZzlbf0DnO2j1WBEUnvsKegjCpZwn93Epo0eIuwaXD108Q5mCzmRFjAsMLlAaRhTEvVsq7NOiRQUje7vatEUkn1t5OtKkwpAJSRao1Hp5ngbbM%2Flb1%2F3cKaozUeJ%2BSuJ5q9CBCSbb7j3vBvmxk2jX8I2KUv5jGorqKgBVi6LtJbOKMuPo4XBH3gB%2BdEoMiKhnHOB%2FYHshQA67slLdfDvyN%2BE%3D; SWID={A393ED4A-3AB9-47FF-8EDB-747983FB025A};'

const axiosInstance = axios.create({withCredentials: true})

export const getMatchupResults = async (week, seasonId) => {
    const result = await axiosInstance.get(`${baseUrl}/${seasonId}/segments/0/leagues/40736849?view=mMatchup&view=mMatchupScore&scoringPeriodId=${1}`, 
    { withCredentials: true, headers: { cookie: 'espn_s2=AEBNiyj2iDnjuTXVAfbzp1pJYeiACmmgU6Wq7sVi%2FR6PadoeiBqbyO1DH59pPiFrj2j46fyrAz6QglTFRfdv6UdBcilVsEz7qoLmze5cFbAyZzlbf0DnO2j1WBEUnvsKegjCpZwn93Epo0eIuwaXD108Q5mCzmRFjAsMLlAaRhTEvVsq7NOiRQUje7vatEUkn1t5OtKkwpAJSRao1Hp5ngbbM%2Flb1%2F3cKaozUeJ%2BSuJ5q9CBCSbb7j3vBvmxk2jX8I2KUv5jGorqKgBVi6LtJbOKMuPo4XBH3gB%2BdEoMiKhnHOB%2FYHshQA67slLdfDvyN%2BE%3D; SWID={A393ED4A-3AB9-47FF-8EDB-747983FB025A};' } })


    return result.data.schedule.filter((matchup) => matchup.matchupPeriodId === week).map((matchup) => ({ 
        
     }))
}

export const getTeamInformation = async (seasonId) => {
    const result = await axiosInstance.get(`${baseUrl}/${seasonId}/segments/0/leagues/40736849?scoringPeriodId=0&view=mRoster&view=mTeam`, 
    { withCredentials: true, headers: { cookie: 'espn_s2=AEBNiyj2iDnjuTXVAfbzp1pJYeiACmmgU6Wq7sVi%2FR6PadoeiBqbyO1DH59pPiFrj2j46fyrAz6QglTFRfdv6UdBcilVsEz7qoLmze5cFbAyZzlbf0DnO2j1WBEUnvsKegjCpZwn93Epo0eIuwaXD108Q5mCzmRFjAsMLlAaRhTEvVsq7NOiRQUje7vatEUkn1t5OtKkwpAJSRao1Hp5ngbbM%2Flb1%2F3cKaozUeJ%2BSuJ5q9CBCSbb7j3vBvmxk2jX8I2KUv5jGorqKgBVi6LtJbOKMuPo4XBH3gB%2BdEoMiKhnHOB%2FYHshQA67slLdfDvyN%2BE%3D; SWID={A393ED4A-3AB9-47FF-8EDB-747983FB025A};' } })
    return result.teams
}