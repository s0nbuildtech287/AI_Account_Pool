import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function saveJsonPlugin() {
  return {
    name: 'save-json-plugin',
    configureServer(server) {
      server.middlewares.use('/api/save-accounts', (req, res) => {
        if (req.method === 'POST') {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', () => {
            try {
              const filePath = path.resolve(process.cwd(), 'src/accounts.json')
              const json = JSON.parse(body)
              fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf-8')
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ status: 'ok' }))
            } catch (err) {
              res.statusCode = 500
              res.end(JSON.stringify({ status: 'error', message: err.message }))
            }
          })
        } else {
          res.statusCode = 405
          res.end()
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), saveJsonPlugin()],
})
