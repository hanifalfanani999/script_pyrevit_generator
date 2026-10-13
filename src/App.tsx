import { useState } from 'react'
import ScriptSection from './components/ScriptSection'
import Documentation from './components/Documentation'
import Header from './components/Header'
import Footer from './components/Footer'

function App() {
  const [activeTab, setActiveTab] = useState<'script' | 'docs' | 'about'>('script')

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header />
      
      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab('script')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'script'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <i className="fas fa-code mr-2"></i>Script
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'docs'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <i className="fas fa-book mr-2"></i>Dokumentasi
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'about'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <i className="fas fa-info-circle mr-2"></i>Tentang
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'script' && <ScriptSection />}
        {activeTab === 'docs' && <Documentation />}
        {activeTab === 'about' && <AboutSection />}
      </main>

      <Footer />
    </div>
  )
}

function AboutSection() {
  return (
    <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">
        <i className="fas fa-info-circle mr-3 text-blue-400"></i>
        Tentang Script Ini
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-750 rounded-lg p-6 bg-gray-900/50 border border-gray-700">
          <h3 className="text-lg font-semibold text-blue-400 mb-3">
            <i className="fas fa-cogs mr-2"></i>Apa itu Kansteen?
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Kansteen (curb) adalah elemen tepi jalan atau pembatas area yang biasanya 
            terbuat dari beton precast. Dalam konteks Revit, kansteen dapat dimodelkan 
            menggunakan family atau elemen model yang mengikuti path tertentu.
          </p>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-green-400 mb-3">
            <i className="fas fa-lightbulb mr-2"></i>Mengapa Script Ini?
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Script ini memungkinkan Anda membuat kansteen secara otomatis berdasarkan 
            path railing yang sudah ada. Ini sangat berguna untuk proyek infrastruktur 
            di mana kansteen mengikuti alur jalan atau trotoar.
          </p>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-yellow-400 mb-3">
            <i className="fas fa-tools mr-2"></i>Teknologi
          </h3>
          <ul className="text-gray-300 text-sm space-y-2">
            <li><i className="fas fa-check text-green-400 mr-2"></i>pyRevit Framework</li>
            <li><i className="fas fa-check text-green-400 mr-2"></i>Revit API (Python)</li>
            <li><i className="fas fa-check text-green-400 mr-2"></i>IronPython 2.7</li>
            <li><i className="fas fa-check text-green-400 mr-2"></i>Revit 2020+</li>
          </ul>
        </div>
        
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-purple-400 mb-3">
            <i className="fas fa-user mr-2"></i>Penulis
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Script ini dibuat untuk memudahkan pekerjaan modelling kansteen di Revit 
            menggunakan pyRevit. Dirilis secara open-source untuk komunitas BIM Indonesia.
          </p>
        </div>
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-700/50">
        <h3 className="text-lg font-semibold text-white mb-3">
          <i className="fas fa-star mr-2 text-yellow-400"></i>Fitur Utama
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center text-sm text-gray-300">
            <i className="fas fa-route text-blue-400 mr-3"></i>
            Mengikuti path railing
          </div>
          <div className="flex items-center text-sm text-gray-300">
            <i className="fas fa-sliders-h text-green-400 mr-3"></i>
            Parameter customizable
          </div>
          <div className="flex items-center text-sm text-gray-300">
            <i className="fas fa-layer-group text-purple-400 mr-3"></i>
            Multi-segment support
          </div>
          <div className="flex items-center text-sm text-gray-300">
            <i className="fas fa-copy text-yellow-400 mr-3"></i>
            Batch processing
          </div>
          <div className="flex items-center text-sm text-gray-300">
            <i className="fas fa-undo text-red-400 mr-3"></i>
            Undo support (Revit)
          </div>
          <div className="flex items-center text-sm text-gray-300">
            <i className="fas fa-file-export text-cyan-400 mr-3"></i>
            Export hasil
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
