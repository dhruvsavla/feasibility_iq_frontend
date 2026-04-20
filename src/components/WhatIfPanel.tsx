import React, { useState } from 'react'
import { StudyInput } from '../types'

export interface WeightConfig {
  recruitment: number
  regulatory: number
  data_quality: number
  compliance: number
  budget: number
}

export const DEFAULT_WEIGHTS: WeightConfig = {
  recruitment: 30,
  regulatory: 25,
  data_quality: 20,
  compliance: 15,
  budget: 10,
}

interface Props {
  studyInput: StudyInput
  setStudyInput: React.Dispatch<React.SetStateAction<StudyInput>>
  onRun: () => void
  isLoading: boolean
  weights: WeightConfig
  onWeightsChange: (w: WeightConfig) => void
  risks: { recruitment: number; data_quality: number; compliance: number; regulatory: number; budget: number } | null
}

const ACTIONS = [
  { id: 'remove5', label: '− 5 Countries', subtitle: 'Remove 5 highest-complexity markets' },
  { id: 'remove10sites', label: '− 10 Sites', subtitle: 'Reduce site count by 10' },
  { id: 'removeRegion', label: 'Remove Highest-Risk Region', subtitle: 'Drop region with most high-complexity markets' },
  { id: 'extendFollowup', label: 'Extend Follow-up +6mo', subtitle: 'Add 6 months to follow-up period' },
  { id: 'reduceSample', label: 'Reduce Sample −20%', subtitle: 'Cut target sample size by 20%' },
  { id: 'simplifyEndpoints', label: 'Simplify Endpoints', subtitle: 'Remove PROs, Biomarker, Pharmacoeconomics' },
]

const WEIGHT_DIMS: Array<{ key: keyof WeightConfig; label: string; desc: string }> = [
  { key: 'recruitment', label: 'Recruitment', desc: 'Enrollment feasibility & screen failure risk' },
  { key: 'regulatory', label: 'Regulatory', desc: 'Approval timelines & site activation' },
  { key: 'data_quality', label: 'Data Quality', desc: 'Endpoint capture & completeness risk' },
  { key: 'compliance', label: 'Compliance', desc: 'GCP obligations & data privacy laws' },
  { key: 'budget', label: 'Budget', desc: 'Cost overrun probability' },
]

function computeScore(risks: Props['risks'], w: WeightConfig): { score: number; grade: string } | null {
  if (!risks) return null
  const total = w.recruitment + w.regulatory + w.data_quality + w.compliance + w.budget
  if (total === 0) return null
  const weighted =
    (risks.recruitment * w.recruitment +
      risks.regulatory * w.regulatory +
      risks.data_quality * w.data_quality +
      risks.compliance * w.compliance +
      risks.budget * w.budget) / total
  const score = Math.max(0, Math.min(100, Math.round(100 - weighted)))
  const grade =
    score >= 85 ? 'Excellent'
    : score >= 70 ? 'Good'
    : score >= 50 ? 'Moderate'
    : score >= 30 ? 'Poor'
    : 'Not Feasible'
  return { score, grade }
}

const gradeColor = (grade: string) => {
  const map: Record<string, string> = {
    Excellent: 'var(--cyan)',
    Good: 'var(--green)',
    Moderate: 'var(--yellow)',
    Poor: 'var(--orange)',
    'Not Feasible': 'var(--red)',
  }
  return map[grade] ?? 'var(--text-secondary)'
}

const WhatIfPanel: React.FC<Props> = ({
  studyInput,
  setStudyInput,
  onRun,
  isLoading,
  weights,
  onWeightsChange,
  risks,
}) => {
  const [runningAction, setRunningAction] = useState<string | null>(null)
  const [weightsOpen, setWeightsOpen] = useState(false)

  const applyAndRun = (actionId: string) => {
    let updated = { ...studyInput }
    switch (actionId) {
      case 'remove5': {
        const complexityOrder = { high: 0, moderate: 1, low: 2 } as const
        const sorted = [...studyInput.countries].sort(
          (a, b) => complexityOrder[a.complexity] - complexityOrder[b.complexity]
        )
        const toRemove = new Set(sorted.slice(0, 5).map((c) => c.code))
        const newCountries = studyInput.countries.filter((c) => !toRemove.has(c.code))
        updated = { ...updated, countries: newCountries, num_countries: newCountries.length }
        break
      }
      case 'remove10sites': {
        updated = { ...updated, num_sites: Math.max(5, studyInput.num_sites - 10) }
        break
      }
      case 'removeRegion': {
        const regionRisk: Record<string, number> = {}
        studyInput.countries.forEach((c) => {
          if (!regionRisk[c.region]) regionRisk[c.region] = 0
          if (c.complexity === 'high') regionRisk[c.region]++
        })
        const entries = Object.entries(regionRisk)
        if (entries.length === 0) break
        const maxRegion = entries.sort((a, b) => b[1] - a[1])[0][0]
        const newCountries = studyInput.countries.filter((c) => c.region !== maxRegion)
        updated = { ...updated, countries: newCountries, num_countries: newCountries.length }
        break
      }
      case 'extendFollowup':
        updated = { ...updated, followup_months: studyInput.followup_months + 6 }
        break
      case 'reduceSample': {
        const rounded = Math.max(50, Math.round((studyInput.sample_size * 0.8) / 50) * 50)
        updated = { ...updated, sample_size: rounded }
        break
      }
      case 'simplifyEndpoints': {
        const toRemove = new Set(['PROs', 'Biomarker', 'Pharmacoeconomics'])
        updated = { ...updated, endpoints: studyInput.endpoints.filter((e) => !toRemove.has(e)) }
        break
      }
    }
    setStudyInput(updated)
    setRunningAction(actionId)
    onRun()
  }

  React.useEffect(() => {
    if (!isLoading) setRunningAction(null)
  }, [isLoading])

  const total = Object.values(weights).reduce((a, b) => a + b, 0)
  const totalOk = total === 100
  const recomputed = computeScore(risks, weights)
  const isDefault =
    weights.recruitment === DEFAULT_WEIGHTS.recruitment &&
    weights.regulatory === DEFAULT_WEIGHTS.regulatory &&
    weights.data_quality === DEFAULT_WEIGHTS.data_quality &&
    weights.compliance === DEFAULT_WEIGHTS.compliance &&
    weights.budget === DEFAULT_WEIGHTS.budget

  return (
    <div style={{ backgroundColor: 'var(--slate)', borderRadius: 12, padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 20, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
          What If Analysis
        </h3>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Instantly see how design changes affect feasibility
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        {ACTIONS.map((action) => {
          const isRunning = runningAction === action.id && isLoading
          return (
            <button
              key={action.id}
              onClick={() => !isLoading && applyAndRun(action.id)}
              disabled={isLoading}
              style={{
                backgroundColor: 'var(--slate-light)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
                padding: '12px 14px',
                textAlign: 'left',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading && !isRunning ? 0.5 : 1,
                transition: 'opacity 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {isRunning && (
                  <div style={{
                    width: 12, height: 12,
                    border: '2px solid var(--slate)',
                    borderTop: '2px solid var(--cyan)',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                    flexShrink: 0,
                  }} />
                )}
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--cyan)' }}>{action.label}</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{action.subtitle}</div>
            </button>
          )
        })}
      </div>

      {/* Weight tuning section */}
      <div style={{ borderTop: '1px solid var(--slate-light)', paddingTop: 16 }}>
        <button
          onClick={() => setWeightsOpen((o) => !o)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: 0,
            width: '100%',
          }}
        >
          <span style={{ fontFamily: '"DM Serif Display", serif', fontSize: 16, color: 'var(--text-primary)' }}>
            Adjust Score Weights
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 4 }}>
            {isDefault ? '(defaults)' : '(customized)'}
          </span>
          <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: 14 }}>
            {weightsOpen ? '▲' : '▼'}
          </span>
        </button>

        {weightsOpen && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Adjust how much each risk dimension contributes to the overall feasibility score.
              Weights must sum to <strong style={{ color: totalOk ? 'var(--green)' : 'var(--red)' }}>100%</strong>
              {' '}(currently <strong style={{ color: totalOk ? 'var(--green)' : 'var(--red)' }}>{total}%</strong>).
              The score recalculates instantly using the existing agent risk scores — no re-analysis needed.
            </p>

            {WEIGHT_DIMS.map(({ key, label, desc }) => (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <div>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 8 }}>{desc}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--cyan)', minWidth: 36, textAlign: 'right' }}>
                    {weights[key]}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={60}
                  step={1}
                  value={weights[key]}
                  onChange={(e) => onWeightsChange({ ...weights, [key]: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--cyan)', cursor: 'pointer' }}
                />
              </div>
            ))}

            {/* Live score preview */}
            {recomputed && totalOk && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(6,182,212,0.08)',
                  border: '1px solid rgba(6,182,212,0.2)',
                  borderRadius: 8,
                  padding: '12px 16px',
                  marginTop: 4,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>
                    Reweighted feasibility score
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    Using your custom weights on the same agent risk scores
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: '"DM Serif Display", serif', fontSize: 28, color: gradeColor(recomputed.grade), lineHeight: 1 }}>
                    {recomputed.score}
                  </div>
                  <div style={{ fontSize: 12, color: gradeColor(recomputed.grade), marginTop: 2 }}>
                    {recomputed.grade}
                  </div>
                </div>
              </div>
            )}

            {!totalOk && (
              <div style={{ fontSize: 12, color: 'var(--red)', backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 6, padding: '8px 12px' }}>
                Weights must sum to exactly 100% before the reweighted score can be shown. Currently: {total}%.
              </div>
            )}

            {/* Reset */}
            {!isDefault && (
              <button
                onClick={() => onWeightsChange({ ...DEFAULT_WEIGHTS })}
                style={{
                  alignSelf: 'flex-start',
                  background: 'none',
                  border: '1px solid var(--slate-light)',
                  borderRadius: 6,
                  padding: '6px 14px',
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                Reset to defaults (30 / 25 / 20 / 15 / 10)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default WhatIfPanel
