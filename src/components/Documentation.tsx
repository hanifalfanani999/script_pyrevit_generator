export default function Documentation() {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <i className="fas fa-book-open mr-3 text-blue-400"></i>
          Dokumentasi Lengkap
        </h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          Script pyRevit ini memungkinkan Anda membuat elemen kansteen (curb/kerb) secara otomatis 
          berdasarkan path dari railing yang sudah ada di model Revit. Script ini sangat berguna 
          untuk proyek infrastruktur, landscape, dan site work.
        </p>
      </div>

      {/* Prerequisites */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <i className="fas fa-clipboard-check mr-3 text-green-400"></i>
          Prasyarat
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start">
              <i className="fas fa-check-circle text-green-400 mt-1 mr-3"></i>
              <div>
                <p className="text-white text-sm font-medium">pyRevit v4.8+</p>
                <p className="text-gray-400 text-xs">Install dari pyrevitlabs.io</p>
              </div>
            </div>
            <div className="flex items-start">
              <i className="fas fa-check-circle text-green-400 mt-1 mr-3"></i>
              <div>
                <p className="text-white text-sm font-medium">Revit 2020 atau lebih baru</p>
                <p className="text-gray-400 text-xs">Support Revit 2020-2025</p>
              </div>
            </div>
            <div className="flex items-start">
              <i className="fas fa-check-circle text-green-400 mt-1 mr-3"></i>
              <div>
                <p className="text-white text-sm font-medium">Python 2.7 / IronPython</p>
                <p className="text-gray-400 text-xs">Sudah termasuk di pyRevit</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start">
              <i className="fas fa-check-circle text-green-400 mt-1 mr-3"></i>
              <div>
                <p className="text-white text-sm font-medium">Floor Type / Wall Type</p>
                <p className="text-gray-400 text-xs">Minimal 1 tipe floor/wall di project</p>
              </div>
            </div>
            <div className="flex items-start">
              <i className="fas fa-check-circle text-green-400 mt-1 mr-3"></i>
              <div>
                <p className="text-white text-sm font-medium">Level di project</p>
                <p className="text-gray-400 text-xs">Minimal 1 level di model</p>
              </div>
            </div>
            <div className="flex items-start">
              <i className="fas fa-check-circle text-green-400 mt-1 mr-3"></i>
              <div>
                <p className="text-white text-sm font-medium">Railing di model</p>
                <p className="text-gray-400 text-xs">Railing sebagai path kansteen</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Installation */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <i className="fas fa-download mr-3 text-yellow-400"></i>
          Cara Instalasi
        </h3>
        
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
            <h4 className="text-white text-sm font-semibold mb-2">1. Buat struktur folder extension:</h4>
            <pre className="text-gray-300 text-xs font-mono overflow-x-auto">
{`KansteenExtension/
├── Kansteen.tab/
│   ├── Kansteen.panel/
│   │   ├── Kansteen.pushbutton/
│   │   │   ├── script.py
│   │   │   └── icon.png (32x32 px)
│   │   └── bundle.yaml
│   └── Kansteen.tab (file kosong)
└── extension.yaml`}
            </pre>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
            <h4 className="text-white text-sm font-semibold mb-2">2. Isi file extension.yaml:</h4>
            <pre className="text-gray-300 text-xs font-mono overflow-x-auto">
{`---
title: Kansteen Tools
author: BIM Indonesia
description: Tools untuk membuat kansteen dari railing`}
            </pre>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
            <h4 className="text-white text-sm font-semibold mb-2">3. Isi file bundle.yaml:</h4>
            <pre className="text-gray-300 text-xs font-mono overflow-x-auto">
{`---
title: Kansteen Generator
layout:
  - Kansteen`}
            </pre>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
            <h4 className="text-white text-sm font-semibold mb-2">4. Copy script.py ke folder pushbutton</h4>
            <p className="text-gray-400 text-xs">
              Download script dari tab "Script" dan simpan sebagai <code className="text-blue-400">script.py</code>
            </p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
            <h4 className="text-white text-sm font-semibold mb-2">5. Lokasi folder extension:</h4>
            <pre className="text-gray-300 text-xs font-mono overflow-x-auto">
{`%APPDATA%/pyRevit/KansteenExtension/
atau
%PROGRAMDATA%/pyRevit/KansteenExtension/`}
            </pre>
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <i className="fas fa-play-circle mr-3 text-blue-400"></i>
          Cara Penggunaan
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              1
            </div>
            <div>
              <p className="text-white text-sm font-medium">Buka Revit dan load model</p>
              <p className="text-gray-400 text-xs mt-1">Pastikan model sudah memiliki railing yang akan dijadikan path kansteen</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              2
            </div>
            <div>
              <p className="text-white text-sm font-medium">Pilih Railing di model</p>
              <p className="text-gray-400 text-xs mt-1">Klik/select railing yang path-nya akan digunakan sebagai jalur kansteen</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              3
            </div>
            <div>
              <p className="text-white text-sm font-medium">Jalankan script dari toolbar pyRevit</p>
              <p className="text-gray-400 text-xs mt-1">Klik tombol "Kansteen from Railing" di tab Kansteen pada pyRevit ribbon</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              4
            </div>
            <div>
              <p className="text-white text-sm font-medium">Pilih metode pembuatan</p>
              <p className="text-gray-400 text-xs mt-1">Pilih antara Floor, Wall, atau Detail Lines sesuai kebutuhan</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              ✓
            </div>
            <div>
              <p className="text-white text-sm font-medium">Kansteen berhasil dibuat!</p>
              <p className="text-gray-400 text-xs mt-1">Elemen kansteen otomatis terpilih dan bisa langsung diedit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Methods Comparison */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <i className="fas fa-balance-scale mr-3 text-purple-400"></i>
          Perbandingan Metode
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Aspek</th>
                <th className="text-left py-3 px-4 text-blue-400 font-medium">Floor</th>
                <th className="text-left py-3 px-4 text-green-400 font-medium">Wall</th>
                <th className="text-left py-3 px-4 text-yellow-400 font-medium">Detail Lines</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-4 font-medium">Output</td>
                <td className="py-3 px-4">Floor element</td>
                <td className="py-3 px-4">Wall element</td>
                <td className="py-3 px-4">Model lines</td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-4 font-medium">Dimensi</td>
                <td className="py-3 px-4">Width only (horizontal)</td>
                <td className="py-3 px-4">Width + Height</td>
                <td className="py-3 px-4">Width only</td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-4 font-medium">3D Solid</td>
                <td className="py-3 px-4"><i className="fas fa-check text-green-400"></i> Ya</td>
                <td className="py-3 px-4"><i className="fas fa-check text-green-400"></i> Ya</td>
                <td className="py-3 px-4"><i className="fas fa-times text-red-400"></i> Tidak</td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-4 font-medium">Material</td>
                <td className="py-3 px-4">Floor material</td>
                <td className="py-3 px-4">Wall material</td>
                <td className="py-3 px-4">N/A</td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="py-3 px-4 font-medium">Cocok untuk</td>
                <td className="py-3 px-4">Site, landscape</td>
                <td className="py-3 px-4">Precast, detail</td>
                <td className="py-3 px-4">Preview, layout</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Kecepatan</td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 bg-green-900/50 text-green-400 rounded text-xs">Cepat</span></td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 bg-green-900/50 text-green-400 rounded text-xs">Cepat</span></td>
                <td className="py-3 px-4"><span className="px-2 py-0.5 bg-yellow-900/50 text-yellow-400 rounded text-xs">Sedang</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Parameters */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <i className="fas fa-sliders-h mr-3 text-cyan-400"></i>
          Parameter Konfigurasi
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
            <h4 className="text-white text-sm font-semibold mb-3">Dimensi Kansteen</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Lebar (width)</span>
                <span className="text-blue-400">150mm (default)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Tinggi (height)</span>
                <span className="text-blue-400">150mm (default)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Offset</span>
                <span className="text-blue-400">0mm (default)</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
            <h4 className="text-white text-sm font-semibold mb-3">Tips Konfigurasi</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex items-start">
                <i className="fas fa-info-circle text-blue-400 mt-0.5 mr-2"></i>
                Ubah nilai di bagian KONFIGURASI pada script
              </li>
              <li className="flex items-start">
                <i className="fas fa-info-circle text-blue-400 mt-0.5 mr-2"></i>
                Satuan dalam mm, otomatis dikonversi ke feet
              </li>
              <li className="flex items-start">
                <i className="fas fa-info-circle text-blue-400 mt-0.5 mr-2"></i>
                Offset positif = ke kiri path, negatif = ke kanan
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <i className="fas fa-wrench mr-3 text-red-400"></i>
          Troubleshooting
        </h3>
        
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
            <h4 className="text-red-400 text-sm font-semibold mb-2">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              "Tidak ada Floor Type ditemukan"
            </h4>
            <p className="text-gray-400 text-xs">
              Pastikan project memiliki minimal 1 Floor Type. Buat Floor Type baru di Manage → Object Styles.
            </p>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
            <h4 className="text-red-400 text-sm font-semibold mb-2">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              "Railing tidak memiliki path curves"
            </h4>
            <p className="text-gray-400 text-xs">
              Beberapa tipe railing (terutama yang di-host pada stair/ramp) tidak memiliki path langsung. 
              Gunakan railing yang di-place pada level.
            </p>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
            <h4 className="text-red-400 text-sm font-semibold mb-2">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              "Kansteen tidak muncul di posisi yang benar"
            </h4>
            <p className="text-gray-400 text-xs">
              Periksa level aktif. Kansteen dibuat pada level pertama atau level aktif view. 
              Sesuaikan offset jika perlu.
            </p>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
            <h4 className="text-red-400 text-sm font-semibold mb-2">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              "Error saat membuat floor untuk arc curve"
            </h4>
            <p className="text-gray-400 text-xs">
              Arc curve di-tessellate menjadi garis-garis pendek. Jika hasilnya tidak halus, 
              pertimbangkan menggunakan metode Wall.
            </p>
          </div>
        </div>
      </div>

      {/* API Reference */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <i className="fas fa-code mr-3 text-orange-400"></i>
          Revit API yang Digunakan
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-white text-sm font-semibold">Classes:</h4>
            <div className="space-y-1">
              {[
                'Autodesk.Revit.DB.Architecture.Railing',
                'Autodesk.Revit.DB.Floor',
                'Autodesk.Revit.DB.Wall',
                'Autodesk.Revit.DB.LocationCurve',
                'Autodesk.Revit.DB.Line',
                'Autodesk.Revit.DB.Arc',
                'Autodesk.Revit.DB.CurveArray',
                'Autodesk.Revit.DB.FilteredElementCollector',
              ].map((cls, i) => (
                <div key={i} className="flex items-center text-xs">
                  <i className="fas fa-cube text-orange-400 mr-2 text-[10px]"></i>
                  <code className="text-gray-300 font-mono">{cls}</code>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-white text-sm font-semibold">Methods:</h4>
            <div className="space-y-1">
              {[
                'Railing.GetPath()',
                'Floor.Create()',
                'Wall.Create()',
                'LocationCurve.Curve',
                'Line.CreateBound()',
                'Arc.Create()',
                'Curve.Tessellate()',
                'Transaction.Start() / Commit()',
              ].map((method, i) => (
                <div key={i} className="flex items-center text-xs">
                  <i className="fas fa-function text-blue-400 mr-2 text-[10px]"></i>
                  <code className="text-gray-300 font-mono">{method}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
