import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createApp } from '../src/app.js'

let server
let baseUrl

before(async () => {
  server = createApp().listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve())
  })
})

test('health endpoint is available without ESPN credentials', async () => {
  const response = await fetch(`${baseUrl}/health`)
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { status: 'ok' })
})

test('dashboard rejects malformed league parameters before upstream access', async () => {
  const response = await fetch(`${baseUrl}/results/baseball/nope/dashboard/2026`)
  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), {
    error: 'Invalid league type or league ID'
  })
})
