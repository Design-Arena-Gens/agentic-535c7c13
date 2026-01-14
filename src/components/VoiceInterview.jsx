import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Volume2, Loader2, MessageCircle, Sparkles } from 'lucide-react'

function VoiceInterview() {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [messages, setMessages] = useState([])
  const [transcript, setTranscript] = useState('')
  const [supported, setSupported] = useState(true)

  const recognitionRef = useRef(null)
  const synthRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const SpeechSynthesis = window.speechSynthesis

    if (!SpeechRecognition || !SpeechSynthesis) {
      setSupported(false)
      return
    }

    // Initialize Speech Recognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      const current = event.resultIndex
      const transcriptText = event.results[current][0].transcript

      if (event.results[current].isFinal) {
        setTranscript('')
        handleUserSpeech(transcriptText)
      } else {
        setTranscript(transcriptText)
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    synthRef.current = SpeechSynthesis

    // Add welcome message
    setMessages([
      {
        type: 'ai',
        text: 'Hello! I\'m your AI interviewer. Click "Start Interview" and tell me about yourself.',
        timestamp: new Date()
      }
    ])

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleUserSpeech = async (text) => {
    // Add user message
    setMessages(prev => [...prev, {
      type: 'user',
      text: text,
      timestamp: new Date()
    }])

    // Simulate thinking
    setIsThinking(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsThinking(false)

    // Generate AI response
    const aiResponse = generateAIResponse(text)

    // Add AI message
    setMessages(prev => [...prev, {
      type: 'ai',
      text: aiResponse,
      timestamp: new Date()
    }])

    // Speak the response
    speakText(aiResponse)
  }

  const generateAIResponse = (userText) => {
    const lowerText = userText.toLowerCase()

    // Simple keyword-based responses
    if (lowerText.includes('hello') || lowerText.includes('hi')) {
      return 'Hello! It\'s great to meet you. Could you start by telling me about your technical background?'
    } else if (lowerText.includes('experience') || lowerText.includes('worked')) {
      return 'That\'s impressive! Can you walk me through a challenging project you\'ve worked on and how you overcame obstacles?'
    } else if (lowerText.includes('project')) {
      return 'Excellent! What technologies did you use in that project, and what was your specific role?'
    } else if (lowerText.includes('skill') || lowerText.includes('know')) {
      return 'Great to hear! How do you stay updated with the latest developments in your field?'
    } else if (lowerText.includes('challenge') || lowerText.includes('problem')) {
      return 'That\'s a thoughtful answer. Can you describe your problem-solving approach when you encounter a technical roadblock?'
    } else if (lowerText.includes('team') || lowerText.includes('collaborate')) {
      return 'Teamwork is crucial! How do you handle disagreements or conflicts within a development team?'
    } else if (lowerText.includes('future') || lowerText.includes('goal')) {
      return 'Those are ambitious goals! What motivates you to pursue a career in technology?'
    } else {
      return 'Interesting! Tell me more about how you approach learning new technologies. What\'s your strategy?'
    }
  }

  const speakText = (text) => {
    if (!synthRef.current) return

    setIsSpeaking(true)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onend = () => {
      setIsSpeaking(false)
    }

    synthRef.current.speak(utterance)
  }

  const startListening = () => {
    if (!recognitionRef.current) return

    try {
      recognitionRef.current.start()
      setIsListening(true)
    } catch (error) {
      console.error('Failed to start recognition:', error)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  if (!supported) {
    return (
      <div className="glass-card p-8 text-center">
        <AlertTriangle className="mx-auto mb-4 text-yellow-500" size={48} />
        <h3 className="text-xl font-bold mb-2">Browser Not Supported</h3>
        <p className="text-gray-400">
          Your browser doesn't support the Web Speech API. Please use Chrome, Edge, or Safari.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="text-electric-purple" size={24} />
            <div>
              <h3 className="font-semibold">AI Voice Interviewer</h3>
              <p className="text-xs text-gray-400">Natural conversation with real-time speech synthesis</p>
            </div>
          </div>
          <div className="flex gap-3">
            {isListening && (
              <span className="flex items-center gap-2 text-emerald-green animate-pulse">
                <Mic size={16} />
                Listening...
              </span>
            )}
            {isSpeaking && (
              <span className="flex items-center gap-2 text-electric-purple animate-pulse">
                <Volume2 size={16} />
                Speaking...
              </span>
            )}
            {isThinking && (
              <span className="flex items-center gap-2 text-yellow-500">
                <Loader2 size={16} className="animate-spin" />
                Thinking...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="glass-card p-6">
        <div className="h-[500px] overflow-y-auto mb-4 space-y-4 pr-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.type === 'user'
                    ? 'bg-electric-purple/20 border border-electric-purple/30 text-white'
                    : 'bg-surface border border-white/10 text-gray-200'
                }`}
              >
                <div className="flex items-start gap-2 mb-1">
                  {msg.type === 'ai' && (
                    <Sparkles size={16} className="text-emerald-green mt-1 flex-shrink-0" />
                  )}
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {/* Live Transcript */}
          {transcript && (
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-electric-purple/10 border border-electric-purple/20 text-gray-400 italic">
                <p className="text-sm">{transcript}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          {!isListening ? (
            <button
              onClick={startListening}
              disabled={isSpeaking}
              className="glass-card px-8 py-4 flex items-center gap-3 hover:bg-emerald-green/20 hover:border-emerald-green/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-border"
            >
              <Mic size={24} className="text-emerald-green" />
              <span className="font-semibold">Start Interview</span>
            </button>
          ) : (
            <button
              onClick={stopListening}
              className="glass-card px-8 py-4 flex items-center gap-3 hover:bg-red-500/20 hover:border-red-500/50 transition-all glow-border animate-pulse"
            >
              <MicOff size={24} className="text-red-500" />
              <span className="font-semibold">Stop Listening</span>
            </button>
          )}

          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="glass-card px-8 py-4 flex items-center gap-3 hover:bg-yellow-500/20 hover:border-yellow-500/50 transition-all"
            >
              <Volume2 size={24} className="text-yellow-500" />
              <span className="font-semibold">Stop Speaking</span>
            </button>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="glass-card p-6">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Sparkles className="text-electric-purple" size={20} />
          Interview Tips
        </h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-emerald-green">✓</span>
            <span>Speak clearly and naturally - the AI will wait for you to finish</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-green">✓</span>
            <span>The AI will respond verbally and display transcripts in the chat</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-green">✓</span>
            <span>Practice common topics: experience, projects, challenges, teamwork</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-green">✓</span>
            <span>Use Chrome or Edge for best speech recognition performance</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default VoiceInterview
