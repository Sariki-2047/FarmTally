'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function DebugEnvPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🔍 Environment Variables Debug
          </h1>

          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Frontend Environment Variables</h2>
              <div className="space-y-2 text-sm font-mono">
                <p><strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}</p>
                <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'}</p>
                <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET (hidden)' : 'NOT SET'}</p>
                <p><strong>NEXT_PUBLIC_SOCKET_URL:</strong> {process.env.NEXT_PUBLIC_SOCKET_URL || 'NOT SET'}</p>
                <p><strong>NEXT_PUBLIC_APP_NAME:</strong> {process.env.NEXT_PUBLIC_APP_NAME || 'NOT SET'}</p>
                <p><strong>NEXT_PUBLIC_APP_VERSION:</strong> {process.env.NEXT_PUBLIC_APP_VERSION || 'NOT SET'}</p>
                <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV || 'NOT SET'}</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Expected Values</h2>
              <div className="space-y-2 text-sm">
                <p><strong>NEXT_PUBLIC_API_URL:</strong> https://qvxcbdglyvzohzdefnet.supabase.co/functions/v1/farmtally-api</p>
                <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> https://qvxcbdglyvzohzdefnet.supabase.co</p>
                <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> Should be set</p>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Test API Connection</h2>
              <button 
                onClick={async () => {
                  try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://qvxcbdglyvzohzdefnet.supabase.co/functions/v1/farmtally-api';
                    const response = await fetch(`${apiUrl}/health`);
                    const data = await response.json();
                    alert('API Test: ' + JSON.stringify(data, null, 2));
                  } catch (error) {
                    alert('API Test Failed: ' + error.message);
                  }
                }}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Test API Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}