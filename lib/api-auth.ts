import { NextRequest } from 'next/server'

export function isAuthorized(req: NextRequest): boolean {
  const apiKey = req.headers.get('x-api-key')
  return apiKey === process.env.API_SECRET_KEY
}

export function unauthorizedResponse() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}
