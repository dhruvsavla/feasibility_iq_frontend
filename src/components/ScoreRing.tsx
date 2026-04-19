import React, { useEffect, useRef, useState } from 'react'

interface Props {
  score: number
  color: string
  delta?: number | null
}

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)

const ScoreRing: React.FC<Props> = ({ score, color, delta }) => {
  const [displayScore, setDisplayScore] = useState(0)
  const rafRef = useRef<number | null>(null)
  const prevScoreRef = useRef<number>(0)

  useEffect(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    const from = prevScoreRef.current
    const to = score
    const duration = 1500
    let start: number | null = null

    const animate = (timestamp: number) => {
      if (start === null) start = timestamp
      const elapsed = timestamp - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutCubic(progress)
      setDisplayScore(Math.round(from + (to - from) * eased))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        prevScoreRef.current = to
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [score])

  const r = 80
  const cx = 100
  const cy = 100
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - displayScore / 100)

  const deltaPositive = delta !== null && delta !== undefined && delta > 0
  const deltaNegative = delta !== null && delta !== undefined && delta < 0
  const deltaLabel =
    delta !== null && delta !== undefined && delta !== 0
      ? `${delta > 0 ? '+' : ''}${delta}`
      : null

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <svg width="200" height="200" viewBox="0 0 200 200">
        {/* Background track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--slate-light)" strokeWidth="12" />
        {/* Score arc */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 0.05s linear' }}
        />
        {/* Score number */}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          dominantBaseline="auto"
          fill="var(--text-primary)"
          fontFamily='"DM Serif Display", serif'
          fontSize="48"
        >
          {displayScore}
        </text>
        {/* /100 label */}
        <text
          x={cx}
          y={cy + 22}
          textAnchor="middle"
          dominantBaseline="auto"
          fill="var(--text-secondary)"
          fontFamily="Inter, sans-serif"
          fontSize="14"
        >
          / 100
        </text>
      </svg>

      {/* Delta badge */}
      {deltaLabel && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 0,
            backgroundColor: deltaPositive ? 'var(--green)' : deltaNegative ? 'var(--red)' : 'var(--slate-light)',
            color: 'white',
            borderRadius: 20,
            padding: '2px 8px',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}
        >
          {deltaLabel}
        </div>
      )}
    </div>
  )
}

export default ScoreRing
