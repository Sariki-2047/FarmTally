'use client'

import { useState, useEffect } from 'react'
import { farmTallyAPI } from '@/lib/supabase'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function TestAPIPage() {
  const [healthStatus, setHealthStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testHealth = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await farmTallyAPI.health()
      setHealthStatus(response)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testSystemAdmin = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await farmTallyAPI.createSystemAdmin({
        email: 'admin@farmtally.in',
        password: 'FarmTallyAdmin2024!',
        firstName: 'System',
        lastName: 'Administrator'
      })
      console.log('System Admin Response:', response)
      alert('System Admin Test: ' + JSON.stringify(response, null, 2))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await farmTallyAPI.login('admin@farmtally.in', 'FarmTallyAdmin2024!')
      console.log('Login Response:', response)
      alert('Login Test: ' + JSON.stringify(response, null, 2))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testHealth()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🧪 FarmTally API Test Dashboard
          </h1>

          {/* Health Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">API Health Status</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              {loading && <p className="text-blue-600">Loading...</p>}
              {error && <p className="text-red-600">Error: {error}</p>}
              {healthStatus && (
                <div>
                  <p className="text-green-600 font-semibold">✅ API is running!</p>
                  <pre className="mt-2 text-sm bg-gray-100 p-2 rounded">
                    {JSON.stringify(healthStatus, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Test Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={testHealth}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Test Health
            </button>
            
            <button
              onClick={testSystemAdmin}
              disabled={loading}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Test System Admin
            </button>
            
            <button
              onClick={testLogin}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              Test Login
            </button>
          </div>

          {/* API Configuration */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Current Configuration</h3>
            <div className="text-sm space-y-1">
              <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL}</p>
              <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
              <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
            </div>
          </div>

          {/* Success Message */}
          {healthStatus && (
            <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                🎉 Frontend Successfully Connected!
              </h3>
              <p className="text-green-700">
                Your Next.js frontend is now connected to your Supabase backend. 
                The FarmTally API is responding correctly!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}