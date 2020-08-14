const axios = require('axios')
const env = require('process').env
const WebSocket = require('ws')

const config = {
  host: env.HOST || '1.solariar.tech',
  port: env.PORT || 32000,
  isSecure: env.IS_SECURE || true
}

let counter = 0

function connect () {
  const url = `${(config.isSecure ? 'wss' : 'ws')}://${config.host}:${config.port}/ws`
  const ws = new WebSocket(url)
  let timeout = 250
  let connectTimeout

  ws.onopen = () => {
    console.log('Connected to ', ws.url)
    timeout = 250
    clearTimeout(connectTimeout)
  }

  ws.onclose = () => {
    console.log('Disconnected. retrying...')
    timeout = Math.min(30000, timeout * 2)
    connectTimeout = setTimeout(() => {
      if (!ws || ws.readyState === WebSocket.CLOSED) connect()
    }, timeout)
  }

  ws.onerror = () => {
    ws.close()
  }

  ws.onmessage = msg => {
    if (msg.type === 'message') {
      const data = JSON.parse(msg.data)
      axios.get('https://api.live.bilibili.com/room/v1/Room/playUrl', {
        params: data
      })
        .then(res => {
          ws.send(JSON.stringify(res.data))
          counter += 1
          console.log('Successfully processed the request to CID ' + JSON.parse(msg.data).cid + '.')
          console.log('Counter: ' + counter)
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
}

connect()
