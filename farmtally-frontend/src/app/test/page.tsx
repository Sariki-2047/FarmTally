export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">FarmTally Frontend</h1>
        <p className="text-lg text-gray-600 mb-8">Frontend is working correctly!</p>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Test Links</h2>
            <div className="space-x-4">
              <a href="/login" className="text-blue-600 hover:underline">Login</a>
              <a href="/register" className="text-blue-600 hover:underline">Register</a>
              <a href="/admin" className="text-blue-600 hover:underline">Admin</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}