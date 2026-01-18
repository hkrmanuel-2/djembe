export default function Settings() {
  return (
    <div className="min-h-screen bg-app-bg text-gray-900 p-8">
      <h1 className="text-4xl font-bold mb-6">Settings</h1>
      <div className="space-y-4">
        <div>
          <label className="block mb-2">User Role</label>
          <select
            className="bg-gray-800 text-white p-2 rounded"
            onChange={(e) => {
              localStorage.setItem('userRole', e.target.value);
              window.location.reload();
            }}
            defaultValue={localStorage.getItem('userRole') || 'student'}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher/Admin</option>
          </select>
        </div>
        {/* Add more settings here */}
      </div>
    </div>
  );
}


