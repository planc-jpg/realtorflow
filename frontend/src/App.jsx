function App() {
  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-10">
          RealtorFlow
        </h1>

        <nav className="space-y-4">
          <button className="block text-left hover:text-blue-400">
            Dashboard
          </button>

          <button className="block text-left hover:text-blue-400">
            Properties
          </button>

          <button className="block text-left hover:text-blue-400">
            Clients
          </button>

          <button className="block text-left hover:text-blue-400">
            AI Writer
          </button>

          <button className="block text-left hover:text-blue-400">
            Appointments
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">

        <h2 className="text-3xl font-bold text-slate-900">
          Dashboard
        </h2>

        <p className="mt-2 text-slate-600">
          Welcome to RealtorFlow.
        </p>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-3 gap-6 mt-8">

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold">
              Active Listings
            </h3>

            <p className="text-4xl font-bold mt-4">
              12
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold">
              Active Clients
            </h3>

            <p className="text-4xl font-bold mt-4">
              28
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold">
              Open Houses
            </h3>

            <p className="text-4xl font-bold mt-4">
              4
            </p>
          </div>

        </div>

      </main>

    </div>
  )
}

export default App