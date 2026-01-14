import React, { useState } from 'react'
import { Upload, FileText, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

function ResumeAudit() {
  const [dragging, setDragging] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [fileName, setFileName] = useState('')

  const criticalSkills = [
    'React', 'Python', 'JavaScript', 'System Design', 'Data Structures',
    'Algorithms', 'SQL', 'Node.js', 'Docker', 'AWS', 'Git', 'API'
  ]

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragging(false)
  }

  const analyzePDF = async (file) => {
    setAnalyzing(true)
    setFileName(file.name)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

      let fullText = ''

      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map(item => item.str).join(' ')
        fullText += pageText + ' '
      }

      // Analyze for skills
      const foundSkills = []
      const missingSkills = []

      criticalSkills.forEach(skill => {
        const regex = new RegExp(skill, 'gi')
        if (regex.test(fullText)) {
          foundSkills.push(skill)
        } else {
          missingSkills.push(skill)
        }
      })

      // Calculate completeness score
      const score = Math.round((foundSkills.length / criticalSkills.length) * 100)

      setAnalysis({
        score,
        foundSkills,
        missingSkills,
        totalWords: fullText.split(/\s+/).length
      })

    } catch (error) {
      console.error('PDF Analysis Error:', error)
      alert('Failed to analyze PDF. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0 && files[0].type === 'application/pdf') {
      await analyzePDF(files[0])
    } else {
      alert('Please upload a PDF file')
    }
  }

  const handleFileInput = async (e) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      await analyzePDF(file)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`glass-card p-12 text-center transition-all cursor-pointer ${
          dragging ? 'glow-border bg-electric-purple/10 scale-[1.02]' : 'hover:bg-white/5'
        }`}
      >
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileInput}
          className="hidden"
          id="resume-upload"
        />
        <label htmlFor="resume-upload" className="cursor-pointer">
          {analyzing ? (
            <Loader2 size={64} className="mx-auto mb-4 text-electric-purple animate-spin" />
          ) : (
            <Upload size={64} className="mx-auto mb-4 text-electric-purple" />
          )}
          <h3 className="text-2xl font-bold mb-2">
            {analyzing ? 'ANALYZING RESUME...' : 'Drop Resume Here'}
          </h3>
          <p className="text-gray-400">
            {analyzing ? 'Extracting text and scanning for skill gaps' : 'PDF format only • Drag & drop or click to upload'}
          </p>
          {fileName && (
            <p className="text-emerald-green mt-2 text-sm">📄 {fileName}</p>
          )}
        </label>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6 animate-fadeIn">
          {/* Score Card */}
          <div className="glass-card p-6 text-center">
            <h3 className="text-lg font-semibold mb-4 text-gray-300">RESUME COMPLETENESS</h3>
            <div className="relative inline-block">
              <svg className="w-32 h-32" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#1f2937"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={analysis.score >= 70 ? '#10b981' : analysis.score >= 50 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8"
                  strokeDasharray={`${analysis.score * 2.51} 251`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold">{analysis.score}%</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-4">{analysis.totalWords} words analyzed</p>
          </div>

          {/* Skills Found */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="text-emerald-green" size={24} />
              <h3 className="text-xl font-bold">Skills Detected</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.foundSkills.map(skill => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-emerald-green/20 border border-emerald-green/50 rounded-full text-emerald-green text-sm"
                >
                  {skill}
                </span>
              ))}
              {analysis.foundSkills.length === 0 && (
                <p className="text-gray-500">No critical skills detected</p>
              )}
            </div>
          </div>

          {/* Skill Gaps */}
          {analysis.missingSkills.length > 0 && (
            <div className="glass-card p-6 border-red-500/30">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="text-red-500" size={24} />
                <h3 className="text-xl font-bold text-red-400">CRITICAL SKILL GAPS</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.missingSkills.map(skill => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-red-400 text-sm"
                  >
                    ⚠️ {skill}
                  </span>
                ))}
              </div>
              <div className="mt-4 p-4 bg-red-500/10 rounded-lg">
                <p className="text-sm text-red-300">
                  <strong>RECOMMENDATION:</strong> Add projects or experiences demonstrating: {analysis.missingSkills.slice(0, 3).join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ResumeAudit
