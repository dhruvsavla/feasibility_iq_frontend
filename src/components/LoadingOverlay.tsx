import React, { useEffect, useState } from 'react'

const STEPS = [
  { text: 'Analyzing therapeutic area and indication profile...', duration: 2000 },
  { text: 'Assessing patient recruitment landscape...', duration: 2500 },
  { text: 'Evaluating regulatory complexity across countries...', duration: 2500 },
  { text: 'Computing risk profile and site activation timelines...', duration: 2000 },
  { text: 'Generating strategic recommendations...', duration: 2000 },
  { text: 'Finalizing feasibility report...', duration: Infinity },
]

interface Props {
  isLoading: boolean
}

const LoadingOverlay: React.FC<Props> = ({ isLoading }) => {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0)
      return
    }

    setCurrentStep(0)
    let step = 0
    const timeouts: ReturnType<typeof setTimeout>[] = []

    const advance = () => {
      if (step < STEPS.length - 1 && STEPS[step].duration !== Infinity) {
        const t = setTimeout(() => {
          step++
          setCurrentStep(step)
          advance()
        }, STEPS[step].duration)
        timeouts.push(t)
      }
    }

    advance()
    return () => timeouts.forEach(clearTimeout)
  }, [isLoading])

  if (!isLoading) return null

  const completedSteps = currentStep
  const progress = (completedSteps / (STEPS.length - 1)) * 100

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: 'rgba(10, 15, 46, 0.96)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
      }}
    >
      {/* Progress bar */}
      <div style={{ width: 480, maxWidth: '90vw' }}>
        <div
          style={{
            height: 4,
            backgroundColor: 'var(--slate-light)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: 'var(--cyan)',
              borderRadius: 2,
              transition: 'width 0.6s ease-out',
            }}
          />
        </div>
      </div>

      {/* Steps list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 480, maxWidth: '90vw' }}>
        {STEPS.map((step, i) => {
          const isDone = i < currentStep
          const isCurrent = i === currentStep
          const isFuture = i > currentStep

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                opacity: isFuture ? 0.35 : 1,
                transition: 'opacity 0.4s ease',
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  border: isDone
                    ? 'none'
                    : isCurrent
                    ? '2px solid var(--cyan)'
                    : '2px solid var(--slate-light)',
                  backgroundColor: isDone ? 'var(--cyan)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  animation: isCurrent ? 'pulse 1.4s ease-in-out infinite' : 'none',
                }}
              >
                {isDone && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="var(--navy)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: isDone ? 'var(--text-secondary)' : isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isCurrent ? 500 : 400,
                }}
              >
                {step.text}
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.4); }
          50% { box-shadow: 0 0 0 6px rgba(6, 182, 212, 0); }
        }
      `}</style>
    </div>
  )
}

export default LoadingOverlay
