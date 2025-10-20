export default function SimplePage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-green-600">FarmTally Works!</h1>
        <p className="text-lg text-gray-600">This is a simple test page</p>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">If you can see this, the frontend is working</p>
          <div className="flex space-x-4 justify-center">
            <a href="/" className="text-blue-600 hover:underline">Home</a>
            <a href="/debug" className="text-blue-600 hover:underline">Debug</a>
            <a href="/login" className="text-blue-600 hover:underline">Login</a>
          </div>
        </div>
      </div>
    </div>
  );
}