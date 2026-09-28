import { createServer } from 'node:http'

const products = [
  {
    id: 'slow-morning',
    name: 'Slow Morning',
    scent: 'Oat milk · honey · cedar',
    price: 890,
    category: 'For unwinding',
  },
  {
    id: 'fig-and-fern',
    name: 'Fig & Fern',
    scent: 'Green fig · moss · vetiver',
    price: 990,
    category: 'For the home',
  },
  {
    id: 'rose-hour',
    name: 'Rose Hour',
    scent: 'Damask rose · pink pepper',
    price: 890,
    category: 'For gifting',
  },
  {
    id: 'after-rain',
    name: 'After Rain',
    scent: 'Petrichor · eucalyptus · oak',
    price: 1090,
    category: 'For unwinding',
  },
]

const server = createServer((request, response) => {
  response.setHeader('Content-Type', 'application/json; charset=utf-8')

  if (request.method !== 'GET') {
    response.writeHead(405, { Allow: 'GET' })
    response.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  if (request.url === '/api/health') {
    response.writeHead(200)
    response.end(JSON.stringify({ status: 'ok', service: 'lizardfy-api' }))
    return
  }

  if (request.url === '/api/products') {
    response.writeHead(200)
    response.end(JSON.stringify({ products, demo: true }))
    return
  }

  response.writeHead(404)
  response.end(JSON.stringify({ error: 'Not found' }))
})

const port = Number(process.env.PORT ?? 3001)
server.listen(port, '127.0.0.1', () => {
  console.log(`Lizardfy API listening on http://127.0.0.1:${port}`)
})
