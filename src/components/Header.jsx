import React from 'react'
import { Zap } from 'lucide-react'

function Header() {
  return (
    <header className="glass-card border-b border-white/10 px-6 py-4 mb-8">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left: PW Logo Placeholder */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-electric-purple to-emerald-green rounded-lg flex items-center justify-center font-bold text-xl">
            PW
          </div>
          <div>
            <h1 className="text-2xl font-bold glow-text">MockMate</h1>
            <p className="text-xs text-gray-400">RIFT Interview System</p>
          </div>
        </div>

        {/* Right: Status Badge */}
        <div className="flex items-center gap-2 glass-card px-4 py-2 animate-pulse-glow glow-border">
          <Zap size={16} className="text-emerald-green" />
          <span className="text-sm font-semibold text-emerald-green">RIFT SYSTEM: ONLINE</span>
        </div>
      </div>
    </header>
  )
}

export default Header
