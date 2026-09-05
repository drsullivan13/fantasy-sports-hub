import app from './app.js'

const port = Number(process.env.PORT) || 5001

app.listen(port, () => {
  console.log(`Fantasy Sports Hub listening on port ${port}`)
})
