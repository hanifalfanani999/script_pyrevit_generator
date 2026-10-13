export default function Header() {
  return (
    <header className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-road text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Kansteen Generator
              </h1>
              <p className="text-sm text-gray-400">
                pyRevit Script — Buat Kansteen dari Railing
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-3">
            <span className="px-3 py-1 bg-green-900/50 text-green-400 text-xs font-medium rounded-full border border-green-700">
              <i className="fas fa-check-circle mr-1"></i>pyRevit v4.8+
            </span>
            <span className="px-3 py-1 bg-blue-900/50 text-blue-400 text-xs font-medium rounded-full border border-blue-700">
              <i className="fas fa-cube mr-1"></i>Revit 2020+
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
