import React, { useRef, useEffect, useState } from 'react'
import Webcam from 'react-webcam'
import { Camera, Loader2, AlertTriangle, CheckCircle, Eye, User } from 'lucide-react'

function BiometricProctor() {
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [modelsReady, setModelsReady] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [metrics, setMetrics] = useState({
    eyeContact: 'UNKNOWN',
    posture: 'UNKNOWN',
    faceDetected: false
  })

  // MediaPipe instances
  const poseRef = useRef(null)
  const faceDetectionRef = useRef(null)

  useEffect(() => {
    loadModels()
    return () => {
      // Cleanup
      if (poseRef.current) poseRef.current.close()
      if (faceDetectionRef.current) faceDetectionRef.current.close()
    }
  }, [])

  const loadModels = async () => {
    try {
      setIsLoading(true)

      // Dynamically import MediaPipe
      const [{ Pose }, { FaceDetection }] = await Promise.all([
        import('@mediapipe/pose'),
        import('@mediapipe/face_detection')
      ])

      // Initialize Face Detection
      const faceDetection = new FaceDetection({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
        }
      })
      faceDetection.setOptions({
        model: 'short',
        minDetectionConfidence: 0.5
      })
      faceDetectionRef.current = faceDetection

      // Initialize Pose
      const pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        }
      })
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      })

      pose.onResults(onPoseResults)
      poseRef.current = pose

      setModelsReady(true)
      setIsLoading(false)
      startDetection()
    } catch (error) {
      console.error('Model loading error:', error)
      setIsLoading(false)
    }
  }

  const onPoseResults = (results) => {
    const canvas = canvasRef.current
    const video = webcamRef.current?.video

    if (!canvas || !video) return

    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (results.poseLandmarks) {
      const landmarks = results.poseLandmarks

      // Draw skeleton
      drawSkeleton(ctx, landmarks, canvas.width, canvas.height)

      // Analyze pose
      analyzePose(landmarks)
    }
  }

  const drawSkeleton = (ctx, landmarks, width, height) => {
    // Connection pairs for skeleton
    const connections = [
      [11, 12], // Shoulders
      [11, 13], // Left arm
      [13, 15], // Left forearm
      [12, 14], // Right arm
      [14, 16], // Right forearm
      [11, 23], // Left torso
      [12, 24], // Right torso
      [23, 24], // Hips
    ]

    // Draw connections
    ctx.strokeStyle = '#8b5cf6'
    ctx.lineWidth = 3
    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start]
      const endPoint = landmarks[end]
      if (startPoint && endPoint) {
        ctx.beginPath()
        ctx.moveTo(startPoint.x * width, startPoint.y * height)
        ctx.lineTo(endPoint.x * width, endPoint.y * height)
        ctx.stroke()
      }
    })

    // Draw key points
    ctx.fillStyle = '#10b981'
    const keyPoints = [0, 11, 12, 13, 14, 15, 16, 23, 24]
    keyPoints.forEach(idx => {
      const point = landmarks[idx]
      if (point) {
        ctx.beginPath()
        ctx.arc(point.x * width, point.y * height, 5, 0, 2 * Math.PI)
        ctx.fill()
      }
    })
  }

  const analyzePose = (landmarks) => {
    const newAlerts = []

    // Eye Contact Check (using nose position as proxy)
    const nose = landmarks[0]
    if (nose) {
      const noseX = nose.x
      if (noseX < 0.35 || noseX > 0.65) {
        newAlerts.push({
          type: 'warning',
          message: '⚠️ MAINTAIN EYE CONTACT',
          icon: 'eye'
        })
        setMetrics(prev => ({ ...prev, eyeContact: 'POOR' }))
      } else {
        setMetrics(prev => ({ ...prev, eyeContact: 'GOOD' }))
      }
    }

    // Posture Check
    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]
    const nosePoint = landmarks[0]

    if (leftShoulder && rightShoulder && nosePoint) {
      const shoulderMidY = (leftShoulder.y + rightShoulder.y) / 2
      const postureDistance = nosePoint.y - shoulderMidY

      // If nose is too close to shoulders (slouching)
      if (postureDistance < 0.15) {
        newAlerts.push({
          type: 'warning',
          message: '⚠️ POSTURE: LOW CONFIDENCE',
          icon: 'user'
        })
        setMetrics(prev => ({ ...prev, posture: 'SLOUCHING' }))
      } else if (postureDistance > 0.2) {
        setMetrics(prev => ({ ...prev, posture: 'OPTIMAL' }))
      } else {
        setMetrics(prev => ({ ...prev, posture: 'FAIR' }))
      }
    }

    setAlerts(newAlerts)
    setMetrics(prev => ({ ...prev, faceDetected: true }))
  }

  const startDetection = async () => {
    if (!modelsReady || !webcamRef.current) return

    const video = webcamRef.current.video

    const detectFrame = async () => {
      if (video && video.readyState === 4 && poseRef.current) {
        await poseRef.current.send({ image: video })
      }
      requestAnimationFrame(detectFrame)
    }

    detectFrame()
  }

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Camera className="text-electric-purple" size={24} />
            <div>
              <h3 className="font-semibold">Biometric Vision System</h3>
              <p className="text-xs text-gray-400">Real-time posture & attention monitoring</p>
            </div>
          </div>
          <div className="flex gap-3">
            {isLoading ? (
              <span className="flex items-center gap-2 text-yellow-500">
                <Loader2 size={16} className="animate-spin" />
                Loading Models...
              </span>
            ) : (
              <span className="flex items-center gap-2 text-emerald-green">
                <CheckCircle size={16} />
                Models Ready
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Video Feed */}
      <div className="glass-card p-6">
        <div className="relative aspect-video bg-surface rounded-lg overflow-hidden">
          {!isLoading ? (
            <>
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                onUserMedia={startDetection}
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ mixBlendMode: 'screen' }}
              />

              {/* Alerts Overlay */}
              <div className="absolute top-4 left-4 right-4 space-y-2">
                {alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className={`glass-card p-3 flex items-center gap-2 ${
                      alert.type === 'warning' ? 'border-red-500/50 bg-red-500/20' : ''
                    }`}
                  >
                    <AlertTriangle className="text-red-500" size={20} />
                    <span className="font-semibold text-red-400">{alert.message}</span>
                  </div>
                ))}
              </div>

              {/* Metrics Overlay */}
              <div className="absolute bottom-4 right-4 space-y-2">
                <div className="glass-card px-3 py-2 text-sm">
                  <span className="text-gray-400">Eye Contact: </span>
                  <span
                    className={`font-bold ${
                      metrics.eyeContact === 'GOOD'
                        ? 'text-emerald-green'
                        : metrics.eyeContact === 'POOR'
                        ? 'text-red-400'
                        : 'text-gray-500'
                    }`}
                  >
                    {metrics.eyeContact}
                  </span>
                </div>
                <div className="glass-card px-3 py-2 text-sm">
                  <span className="text-gray-400">Posture: </span>
                  <span
                    className={`font-bold ${
                      metrics.posture === 'OPTIMAL'
                        ? 'text-emerald-green'
                        : metrics.posture === 'SLOUCHING'
                        ? 'text-red-400'
                        : metrics.posture === 'FAIR'
                        ? 'text-yellow-500'
                        : 'text-gray-500'
                    }`}
                  >
                    {metrics.posture}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 size={48} className="mx-auto mb-4 text-electric-purple animate-spin" />
                <p className="text-lg font-semibold">Initializing Vision Models...</p>
                <p className="text-sm text-gray-400 mt-2">Loading MediaPipe Pose & Face Detection</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="glass-card p-6">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Eye className="text-electric-purple" size={20} />
          Monitoring Guidelines
        </h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-emerald-green">✓</span>
            <span><strong>Eye Contact:</strong> Keep your face centered and look at the camera</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-green">✓</span>
            <span><strong>Posture:</strong> Sit upright with shoulders back and relaxed</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-green">✓</span>
            <span><strong>Lighting:</strong> Ensure your face is well-lit and clearly visible</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default BiometricProctor
