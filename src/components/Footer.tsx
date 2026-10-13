export default function Footer() {
  return (
    <footer className="bg-gray-800 border-t border-gray-700 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm">
            <i className="fas fa-code mr-2"></i>
            pyRevit Kansteen Generator Script — Open Source
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-gray-500 text-xs">
              <i className="fas fa-heart text-red-400 mr-1"></i>
              Dibuat untuk komunitas BIM Indonesia
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
