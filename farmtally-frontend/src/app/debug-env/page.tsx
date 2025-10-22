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
                <p><strong>NEXT_PUBLIC_AUTH_URL:</strong> {process.env.NEXT_PUBLIC_AUTH_URL || 'NOT SET'}</p>
                <p><strong>NEXT_PUBLIC_FIELD_MANAGER_URL:</strong> {process.env.NEXT_PUBLIC_FIELD_MANAGER_URL || 'NOT SET'}</p>
                <p><strong>NEXT_PUBLIC_FARM_ADMIN_URL:</strong> {process.env.NEXT_PUBLIC_FARM_ADMIN_URL || 'NOT SET'}</p>
                <p><strong>NEXT_PUBLIC_SOCKET_URL:</strong> {process.env.NEXT_PUBLIC_SOCKET_URL || 'NOT SET'}</p>
                <p><strong>NEXT_PUBLIC_APP_NAME:</strong> {process.env.NEXT_PUBLIC_APP_NAME || 'NOT SET'}</p>
                <p><strong>NEXT_PUBLIC_APP_VERSION:</strong> {process.env.NEXT_PUBLIC_APP_VERSION || 'NOT SET'}</p>
                <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV || 'NOT SET'}</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Expected Microservices URLs</h2>
              <div className="space-y-2 text-sm">
                <p><strong>NEXT_PUBLIC_API_URL:</strong> http://147.93.153.247:8090 (API Gateway)</p>
                <p><strong>NEXT_PUBLIC_AUTH_URL:</strong> http://147.93.153.247:8081 (Auth Service)</p>
                <p><strong>NEXT_PUBLIC_FIELD_MANAGER_URL:</strong> http://147.93.153.247:8088 (Field Manager)</p>
                <p><strong>NEXT_PUBLIC_FARM_ADMIN_URL:</strong> http://147.93.153.247:8089 (Farm Admin)</p>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Test API Connection</h2>
              <button 
                onClick={async () => {
                  try {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://147.93.153.247:8090';
                    const response = await fetch(`${apiUrl}/`);
                    const data = await response.json();
                    alert('API Gateway Test: ' + JSON.stringify(data, null, 2));
                  } catch (error: any) {
                    alert('API Test Failed: ' + error.message);
                  }
                }}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Test Microservices Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}