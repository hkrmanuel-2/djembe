export default function Dashboard() {
  return (
    <div className="min-h-screen bg-app-bg text-gray-900 p-8">
      <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">Total Students</h2>
          <p className="text-4xl">0</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">Active Assignments</h2>
          <p className="text-4xl">0</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">Completion Rate</h2>
          <p className="text-4xl">0%</p>
        </div>
      </div>
      {/* Add more dashboard content here */}
    </div>
  );
}


