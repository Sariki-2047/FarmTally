'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState } from 'react'

export default function SimpleLoginTest() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    setResult('Testing...')
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://qvxcbdglyvzohzdefnet.supabase.co/functions/v1/farmtally-api'
      const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eGNiZGdseXZ6b2h6ZGVmbmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTQxMzgsImV4cCI6MjA3NjI3MDEzOH0.hMzK3q1lQQPy7y0KMURxN-NwlOMO7WN_wFttWMyu9GM'
      
      console.log('API URL:', API_URL)
      console.log('Using anon key:', SUPABASE_ANON_KEY ? 'SET' : 'NOT SET')
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: 'admin@farmtally.in',
          password: 'FarmTallyAdmin2024!'
        })
      })

      console.log('Response status:', response.status)
      
      const data = await response.json()
      
      if (response.ok) {
        setResult(`✅ SUCCESS!\n\nUser: ${data.data.user.email}\nRole: ${data.data.user.role}\nToken: ${data.data.tokens.accessToken.substring(0, 50)}...`)
      } else {
        setResult(`❌ FAILED!\n\nStatus: ${response.status}\nError: ${data.message || data.error}\n\nFull response: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (error) {
      setResult(`❌ NETWORK ERROR!\n\n${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🧪 Simple Login Test
          </h1>

          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Test Direct API Login</h2>
              <p className="text-sm text-gray-600 mb-4">
                This bypasses the auth store and tests the API directly.
              </p>
              <button 
                onClick={testLogin}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Login'}
              </button>
            </div>

            {result && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Result:</h3>
                <pre className="text-sm whitespace-pre-wrap">{result}</pre>
              </div>
            )}

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Environment Check:</h3>
              <div className="text-sm space-y-1">
                <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Using fallback'}</p>
                <p><strong>Supabase Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'Using fallback'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}