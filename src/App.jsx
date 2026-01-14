import React, { useState } from 'react'
import Header from './components/Header'
import ResumeAudit from './components/ResumeAudit'
import BiometricProctor from './components/BiometricProctor'
import VoiceInterview from './components/VoiceInterview'
import { FileText, Eye, Mic } from 'lucide-react'

function App() {
  const [activeModule, setActiveModule] = useState('resume')

  return (
    <div className="min-h-screen bg-rich-black">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Module Navigation */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <button
            onClick={() => setActiveModule('resume')}
            className={`glass-card px-6 py-3 flex items-center gap-3 transition-all ${
              activeModule === 'resume'
                ? 'glow-border bg-electric-purple/20 text-electric-purple'
                : 'hover:bg-white/10'
            }`}
          >
            <FileText size={20} />
            <span className="font-semibold">Resume Audit</span>
          </button>

          <button
            onClick={() => setActiveModule('proctor')}
            className={`glass-card px-6 py-3 flex items-center gap-3 transition-all ${
              activeModule === 'proctor'
                ? 'glow-border bg-electric-purple/20 text-electric-purple'
                : 'hover:bg-white/10'
            }`}
          >
            <Eye size={20} />
            <span className="font-semibold">Biometric Proctor</span>
          </button>

          <button
            onClick={() => setActiveModule('voice')}
            className={`glass-card px-6 py-3 flex items-center gap-3 transition-all ${
              activeModule === 'voice'
                ? 'glow-border bg-electric-purple/20 text-electric-purple'
                : 'hover:bg-white/10'
            }`}
          >
            <Mic size={20} />
            <span className="font-semibold">Voice Interview</span>
          </button>
        </div>

        {/* Active Module Content */}
        <div className="max-w-6xl mx-auto">
          {activeModule === 'resume' && <ResumeAudit />}
          {activeModule === 'proctor' && <BiometricProctor />}
          {activeModule === 'voice' && <VoiceInterview />}
        </div>
      </div>
    </div>
  )
}

export default App
