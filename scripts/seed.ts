import fs from 'fs'
import path from 'path'
import { seedProjects, seedPosts } from '../lib/seed-data'

function loadEnv(): Record<string, string> {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return {}
  return fs
    .readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .reduce<Record<string, string>>((acc, line) => {
      const idx = line.indexOf('=')
      acc[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
      return acc
    }, {})
}

const env = loadEnv()
const API_KEY = env.API_SECRET_KEY || process.env.API_SECRET_KEY || ''
const BASE_URL = env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

async function post(endpoint: string, body: unknown) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || res.statusText)
  return json
}

async function seed() {
  if (!API_KEY) {
    console.error('API_SECRET_KEY not found in .env.local')
    process.exit(1)
  }

  console.log(`Seeding to ${BASE_URL}...`)

  console.log('\n── Projects ──')
  for (const project of seedProjects) {
    try {
      await post('/api/projects', project)
      console.log(`  ✓ ${project.title}`)
    } catch (e: any) {
      console.log(`  ✗ ${project.title}: ${e.message}`)
    }
  }

  console.log('\n── Blog Posts ──')
  for (const post_ of seedPosts) {
    try {
      await post('/api/posts', post_)
      console.log(`  ✓ ${post_.title}`)
    } catch (e: any) {
      console.log(`  ✗ ${post_.title}: ${e.message}`)
    }
  }

  console.log('\nDone.')
}

seed()
