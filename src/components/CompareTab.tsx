import React from 'react'
import { SavedReport } from '../types'

interface Props {
  savedReports: SavedReport[]
}

const gradeColor = (grade: string): string => {
  const map: Record<string, string> = {
    Excellent: 'var(--cyan)',
    Good: 'var(--green)',
    Moderate: 'var(--yellow)',
    Poor: 'var(--orange)',
    'Not Feasible': 'var(--red)',
  }
  return map[grade] ?? 'var(--text-secondary)'
}

type Direction = 'up' | 'down' | 'same'

function delta(current: number, baseline: number, higherIsBetter: boolean): Direction {
  if (current === baseline) return 'same'
  const better = higherIsBetter ? current > baseline : current < baseline
  return better ? 'up' : 'down'
}

function deltaVal(current: number, baseline: number): number {
  return current - baseline
}

const DeltaArrow: React.FC<{ dir: Direction; val: number }> = ({ dir, val }) => {
  if (dir === 'same') return null
  const color = dir === 'up' ? 'var(--green)' : 'var(--red)'
  const arrow = dir === 'up' ? '↑' : '↓'
  return (
    <span style={{ color, fontSize: 12, fontWeight: 700, marginLeft: 4 }}>
      {arrow}{Math.abs(val)}
    </span>
  )
}

const riskBarColor = (v: number) => {
  if (v <= 40) return 'var(--green)'
  if (v <= 70) return 'var(--yellow)'
  return 'var(--red)'
}

const CompareTab: React.FC<Props> = ({ savedReports }) => {
  if (savedReports.length < 2) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 80,
          gap: 16,
          color: 'var(--text-secondary)',
        }}
      >
        <div style={{ fontSize: 40 }}>⚖️</div>
        <div style={{ fontFamily: '"DM Serif Display", serif', fontSize: 22, color: 'var(--text-primary)' }}>
          No comparison available yet
        </div>
        <div style={{ fontSize: 14, textAlign: 'center', maxWidth: 360 }}>
          Run at least 2 analyses and save them using the "Save to Comparison" button on the report tab.
        </div>
      </div>
    )
  }

  const displays = savedReports.slice(0, 3)
  const baseline = displays[0].report
  const colCount = displays.length

  const colStyle: React.CSSProperties = {
    flex: 1,
    textAlign: 'center',
    padding: '0 8px',
  }

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid var(--slate-light)',
  }

  const labelStyle: React.CSSProperties = {
    minWidth: 200,
    color: 'var(--text-secondary)',
    fontSize: 13,
  }

  const dataRiskRank = { Low: 0, Medium: 1, High: 2 }

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: 'var(--slate)',
          borderRadius: 12,
          padding: 24,
        }}
      >
        <h3
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: 22,
            color: 'var(--text-primary)',
            margin: '0 0 20px 0',
          }}
        >
          Study Comparison
        </h3>

        {/* Column headers */}
        <div style={{ display: 'flex', marginBottom: 16 }}>
          <div style={{ minWidth: 200 }} />
          {displays.map((sr, i) => (
            <div key={i} style={{ ...colStyle, borderLeft: '1px solid var(--slate-light)' }}>
              <div
                style={{
                  fontFamily: '"DM Serif Display", serif',
                  fontSize: 15,
                  color: 'var(--text-primary)',
                  marginBottom: 4,
                }}
              >
                {sr.label}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                {new Date(sr.timestamp).toLocaleDateString()} {new Date(sr.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              {i === 0 && (
                <div
                  style={{
                    fontSize: 10,
                    color: 'var(--cyan)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginTop: 4,
                  }}
                >
                  Baseline
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Feasibility Score */}
        <div style={{ ...rowStyle, alignItems: 'flex-start', paddingTop: 16 }}>
          <div style={{ ...labelStyle, paddingTop: 8 }}>Feasibility Score</div>
          {displays.map((sr, i) => {
            const dir = i === 0 ? 'same' : delta(sr.report.feasibility_score, baseline.feasibility_score, true)
            const dv = i === 0 ? 0 : deltaVal(sr.report.feasibility_score, baseline.feasibility_score)
            return (
              <div key={i} style={{ ...colStyle, borderLeft: '1px solid var(--slate-light)' }}>
                <div
                  style={{
                    fontFamily: '"DM Serif Display", serif',
                    fontSize: 36,
                    color: gradeColor(sr.report.grade),
                    lineHeight: 1,
                  }}
                >
                  {sr.report.feasibility_score}
                  <DeltaArrow dir={dir} val={dv} />
                </div>
                <div style={{ fontSize: 12, color: gradeColor(sr.report.grade), marginTop: 4, fontWeight: 600 }}>
                  {sr.report.grade}
                </div>
              </div>
            )
          })}
        </div>

        {/* Metrics rows */}
        {[
          { label: 'Enrollment Probability', key: 'enrollment_probability' as const, unit: '%', higherBetter: true },
          { label: 'Screen Failure Rate', key: 'screen_failure_rate' as const, unit: '%', higherBetter: false },
          { label: 'Site Activation', key: 'site_activation_weeks' as const, unit: 'wks', higherBetter: false },
          { label: 'Dropout Rate', key: 'dropout_rate' as const, unit: '%', higherBetter: false },
          { label: 'Regulatory ETA', key: 'regulatory_eta_months' as const, unit: 'mo', higherBetter: false },
        ].map(({ label, key, unit, higherBetter }) => (
          <div key={key} style={rowStyle}>
            <div style={labelStyle}>{label}</div>
            {displays.map((sr, i) => {
              const val = sr.report[key]
              const dir = i === 0 ? 'same' : delta(val, baseline[key], higherBetter)
              const dv = i === 0 ? 0 : deltaVal(val, baseline[key])
              return (
                <div key={i} style={{ ...colStyle, borderLeft: '1px solid var(--slate-light)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {val}{unit}
                  <DeltaArrow dir={dir} val={dv} />
                </div>
              )
            })}
          </div>
        ))}

        {/* Data completeness risk */}
        <div style={rowStyle}>
          <div style={labelStyle}>Data Completeness Risk</div>
          {displays.map((sr, i) => {
            const val = sr.report.data_completeness_risk
            const baseRank = dataRiskRank[baseline.data_completeness_risk]
            const curRank = dataRiskRank[val]
            const dir: Direction =
              i === 0 ? 'same' : curRank < baseRank ? 'up' : curRank > baseRank ? 'down' : 'same'
            const color = val === 'Low' ? 'var(--green)' : val === 'Medium' ? 'var(--yellow)' : 'var(--red)'
            return (
              <div key={i} style={{ ...colStyle, borderLeft: '1px solid var(--slate-light)', fontWeight: 600 }}>
                <span style={{ color }}>{val}</span>
                {dir !== 'same' && (
                  <span style={{ color: dir === 'up' ? 'var(--green)' : 'var(--red)', fontSize: 12, marginLeft: 4 }}>
                    {dir === 'up' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Risk Profile comparison */}
      <div style={{ backgroundColor: 'var(--slate)', borderRadius: 12, padding: 24 }}>
        <h3 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 18, color: 'var(--text-primary)', margin: '0 0 20px 0' }}>
          Risk Profile Comparison
        </h3>

        {(['recruitment', 'data_quality', 'compliance', 'regulatory', 'budget'] as const).map((key) => {
          const riskLabel = key.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) + ' Risk'
          return (
            <div key={key} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{riskLabel}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {displays.map((sr, i) => {
                  const val = sr.report.risks[key]
                  return (
                    <div key={i} style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, textAlign: 'center' }}>
                        {colCount > 1 ? sr.label.slice(0, 10) : ''}
                      </div>
                      <div
                        style={{
                          height: 8,
                          backgroundColor: 'var(--slate-light)',
                          borderRadius: 4,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${val}%`,
                            backgroundColor: riskBarColor(val),
                            borderRadius: 4,
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'right', marginTop: 2 }}>
                        {val}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CompareTab
