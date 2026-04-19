import React, { useEffect, useRef, useState } from 'react'
import { FeasibilityReport, StudyInput } from '../types'
import ScoreRing from './ScoreRing'
import WhatIfPanel from './WhatIfPanel'

interface Props {
  report: FeasibilityReport
  studyInput: StudyInput
  setStudyInput: React.Dispatch<React.SetStateAction<StudyInput>>
  onRun: () => void
  onSave: () => void
  previousScore: number | null
  isLoading: boolean
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

const riskBarColor = (value: number): string => {
  if (value <= 40) return 'var(--green)'
  if (value <= 70) return 'var(--yellow)'
  return 'var(--red)'
}

const chipStyle = (status: 'on-track' | 'moderate' | 'critical'): React.CSSProperties => {
  const map: Record<string, React.CSSProperties> = {
    'on-track': { backgroundColor: 'var(--cyan)', color: 'var(--navy)' },
    moderate: { backgroundColor: 'var(--yellow)', color: 'var(--navy)' },
    critical: { backgroundColor: 'var(--red)', color: 'white' },
  }
  return map[status]
}

const badgeStyle = (color: string): React.CSSProperties => ({
  display: 'inline-block',
  padding: '2px 10px',
  borderRadius: 20,
  fontSize: 11,
  fontWeight: 600,
  backgroundColor: color,
  color: 'white',
  alignSelf: 'flex-start',
  letterSpacing: '0.03em',
})

const INDUSTRY_AVG: Record<string, number> = {
  recruitment: 45,
  data_quality: 40,
  compliance: 35,
  regulatory: 50,
  budget: 40,
}

const KPI_TOOLTIPS: Record<string, string> = {
  enrollment_probability:
    'Likelihood of hitting your target patient count on time. Industry avg: 60–80% for common indications, 30–50% for rare diseases. Driven by indication prevalence, eligibility criteria strictness, and site count.',
  screen_failure_rate:
    '% of screened patients who don\'t qualify. Industry avg: 20–35% common indications, 45–70% rare diseases. Driven by eligibility criteria complexity and indication rarity.',
  site_activation_weeks:
    'Weeks from study start to first site enrolling. Industry avg: 8–14 weeks (simple), 16–26 weeks (complex multi-country). Driven by country count and regulatory complexity.',
  dropout_rate:
    '% of enrolled patients who leave before study end. Industry avg: 8–12% for <18mo studies, 15–25% for 18–36mo, 20–35% for >36mo. Driven by study duration and endpoint burden.',
  data_completeness_risk:
    'Risk of data gaps that could invalidate analysis. Driven by endpoint types (PROs and biomarkers are highest risk), number of countries, and site training quality.',
  regulatory_eta_months:
    'Months to obtain all regulatory approvals before enrollment can begin. Industry avg: 3–6mo (1–5 countries), 7–12mo (6–15 countries), 12–20mo (16+ countries).',
}

interface KpiCardProps {
  icon: string
  label: string
  value: string
  badge?: string
  badgeColor?: string
  tooltipKey: string
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, label, value, badge, badgeColor, tooltipKey }) => {
  const [showTip, setShowTip] = useState(false)
  const tooltip = KPI_TOOLTIPS[tooltipKey]

  return (
    <div
      style={{
        backgroundColor: 'var(--slate)',
        borderRadius: 12,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 22 }}>{icon}</div>
        {tooltip && (
          <div style={{ position: 'relative' }}>
            <button
              onMouseEnter={() => setShowTip(true)}
              onMouseLeave={() => setShowTip(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 14,
                padding: '0 2px',
                lineHeight: 1,
              }}
            >
              ⓘ
            </button>
            {showTip && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 24,
                  width: 280,
                  backgroundColor: '#1a2540',
                  border: '1px solid var(--slate-light)',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  zIndex: 50,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
              >
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{ color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: 28,
          color: 'var(--cyan)',
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {badge && badgeColor && <div style={badgeStyle(badgeColor)}>{badge}</div>}
    </div>
  )
}

const FeasibilityReportTab: React.FC<Props> = ({
  report,
  studyInput,
  setStudyInput,
  onRun,
  onSave,
  previousScore,
  isLoading,
}) => {
  const [barsVisible, setBarsVisible] = useState(false)
  const [exporting, setExporting] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setBarsVisible(false)
    const timer = setTimeout(() => setBarsVisible(true), 150)
    return () => clearTimeout(timer)
  }, [report])

  const scoreColor = gradeColor(report.grade)
  const scoreDelta =
    previousScore !== null ? report.feasibility_score - previousScore : null

  const enrollBadge =
    report.enrollment_probability >= 60
      ? { label: 'High', color: 'var(--green)' }
      : report.enrollment_probability >= 40
      ? { label: 'Medium', color: 'var(--yellow)' }
      : { label: 'Low', color: 'var(--red)' }

  const sfBadge =
    report.screen_failure_rate <= 25
      ? { label: 'Low', color: 'var(--green)' }
      : report.screen_failure_rate <= 40
      ? { label: 'Moderate', color: 'var(--yellow)' }
      : { label: 'High', color: 'var(--red)' }

  const siteBadge =
    report.site_activation_weeks <= 12
      ? { label: 'Fast', color: 'var(--green)' }
      : report.site_activation_weeks <= 20
      ? { label: 'Moderate', color: 'var(--yellow)' }
      : { label: 'Slow', color: 'var(--red)' }

  const dropoutBadge =
    report.dropout_rate <= 10
      ? { label: 'Low', color: 'var(--green)' }
      : report.dropout_rate <= 20
      ? { label: 'Moderate', color: 'var(--yellow)' }
      : { label: 'High', color: 'var(--red)' }

  const dataRiskColor: Record<string, string> = {
    Low: 'var(--green)',
    Medium: 'var(--yellow)',
    High: 'var(--red)',
  }

  const riskItems: Array<{ label: string; key: keyof typeof report.risks }> = [
    { label: 'Recruitment Risk', key: 'recruitment' },
    { label: 'Data Quality Risk', key: 'data_quality' },
    { label: 'Compliance Risk', key: 'compliance' },
    { label: 'Regulatory Risk', key: 'regulatory' },
    { label: 'Budget Risk', key: 'budget' },
  ]

  const sectionCard: React.CSSProperties = {
    backgroundColor: 'var(--slate)',
    borderRadius: 12,
    padding: 24,
  }

  const sectionTitle: React.CSSProperties = {
    fontFamily: '"DM Serif Display", serif',
    fontSize: 22,
    color: 'var(--text-primary)',
    margin: '0 0 20px 0',
  }

  const handleExportPDF = async () => {
    if (!reportRef.current) return
    setExporting(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#0a0f2e',
        useCORS: true,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * pageWidth) / canvas.width

      let y = 0
      let remaining = imgHeight

      while (remaining > 0) {
        if (y > 0) pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, -y, imgWidth, imgHeight)
        y += pageHeight
        remaining -= pageHeight
      }

      const filename = studyInput.study_name
        ? `${studyInput.study_name}-FeasibilityIQ-Report.pdf`
        : 'FeasibilityIQ-Report.pdf'
      pdf.save(filename)
    } catch (err) {
      console.error('PDF export failed:', err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div ref={reportRef} id="feasibility-report" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top action bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button
          onClick={onSave}
          style={{
            backgroundColor: 'var(--slate)',
            border: '1px solid var(--slate-light)',
            borderRadius: 8,
            padding: '8px 16px',
            color: 'var(--text-primary)',
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Save to Comparison
        </button>
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          style={{
            background: 'linear-gradient(135deg, var(--cyan) 0%, #3b82f6 100%)',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            color: 'white',
            fontSize: 13,
            fontWeight: 600,
            cursor: exporting ? 'not-allowed' : 'pointer',
            opacity: exporting ? 0.7 : 1,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {exporting ? 'Exporting...' : 'Export PDF'}
        </button>
      </div>

      {/* Row 1 — Score + Executive Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24 }}>
        <div
          style={{
            ...sectionCard,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            justifyContent: 'center',
          }}
        >
          <ScoreRing score={report.feasibility_score} color={scoreColor} delta={scoreDelta} />
          <div
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: 26,
              color: scoreColor,
              textAlign: 'center',
            }}
          >
            {report.grade}
          </div>
        </div>

        <div style={{ ...sectionCard, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ ...sectionTitle, marginBottom: 0 }}>Executive Summary</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0, fontSize: 14 }}>
            {report.executive_summary}
          </p>
          <h3 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 18, color: 'var(--text-primary)', margin: 0 }}>
            Critical Success Factors
          </h3>
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {report.critical_success_factors.map((f, i) => (
              <li key={i} style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* What If Panel */}
      <WhatIfPanel
        studyInput={studyInput}
        setStudyInput={setStudyInput}
        onRun={onRun}
        isLoading={isLoading}
      />

      {/* Row 2 — KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <KpiCard
          icon="🎯"
          label="Enrollment Probability"
          value={`${report.enrollment_probability}%`}
          badge={enrollBadge.label}
          badgeColor={enrollBadge.color}
          tooltipKey="enrollment_probability"
        />
        <KpiCard
          icon="🔍"
          label="Screen Failure Rate"
          value={`${report.screen_failure_rate}%`}
          badge={sfBadge.label}
          badgeColor={sfBadge.color}
          tooltipKey="screen_failure_rate"
        />
        <KpiCard
          icon="⚡"
          label="Site Activation"
          value={`${report.site_activation_weeks} weeks`}
          badge={siteBadge.label}
          badgeColor={siteBadge.color}
          tooltipKey="site_activation_weeks"
        />
        <KpiCard
          icon="📉"
          label="Patient Dropout Rate"
          value={`${report.dropout_rate}%`}
          badge={dropoutBadge.label}
          badgeColor={dropoutBadge.color}
          tooltipKey="dropout_rate"
        />
        <KpiCard
          icon="📊"
          label="Data Completeness Risk"
          value={report.data_completeness_risk}
          badge={report.data_completeness_risk}
          badgeColor={dataRiskColor[report.data_completeness_risk]}
          tooltipKey="data_completeness_risk"
        />
        <KpiCard
          icon="🏛️"
          label="Regulatory ETA"
          value={`${report.regulatory_eta_months} months`}
          tooltipKey="regulatory_eta_months"
        />
      </div>

      {/* Row 3 — Risk Profile with benchmark markers */}
      <div style={sectionCard}>
        <h3 style={sectionTitle}>Risk Profile</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {riskItems.map(({ label, key }) => {
            const value = report.risks[key]
            const avg = INDUSTRY_AVG[key]

            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ minWidth: 180, color: 'var(--text-secondary)', fontSize: 14 }}>{label}</div>
                <div style={{ flex: 1, position: 'relative' }}>
                  {/* Industry avg label */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${avg}%`,
                      top: -18,
                      transform: 'translateX(-50%)',
                      fontSize: 9,
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Avg
                  </div>
                  {/* Track */}
                  <div
                    style={{
                      backgroundColor: 'var(--slate-light)',
                      borderRadius: 9999,
                      height: 10,
                      overflow: 'visible',
                      position: 'relative',
                    }}
                  >
                    {/* Fill bar */}
                    <div
                      style={{
                        height: '100%',
                        width: barsVisible ? `${value}%` : '0%',
                        backgroundColor: riskBarColor(value),
                        borderRadius: 9999,
                        transition: 'width 1s ease-out',
                      }}
                    />
                    {/* Industry avg marker */}
                    <AvgMarker avg={avg} riskKey={key} />
                  </div>
                </div>
                <div
                  style={{
                    minWidth: 36,
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {value}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Row 4 — Study Timeline */}
      <div style={sectionCard}>
        <h3 style={sectionTitle}>Study Timeline</h3>
        <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 'max-content' }}>
            {report.timeline.map((phase, i) => (
              <React.Fragment key={i}>
                <div
                  style={{
                    ...chipStyle(phase.status),
                    padding: '10px 18px',
                    borderRadius: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    minWidth: 130,
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{phase.phase}</div>
                  <div style={{ fontSize: 11, opacity: 0.75 }}>{phase.weeks}w</div>
                </div>
                {i < report.timeline.length - 1 && (
                  <div style={{ color: 'var(--text-secondary)', fontSize: 20, flexShrink: 0 }}>→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Row 5 — Strategic Recommendations */}
      <div style={sectionCard}>
        <h3 style={sectionTitle}>Strategic Recommendations</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {report.recommendations.map((rec, i) => (
            <div
              key={i}
              style={{
                backgroundColor: 'var(--slate-light)',
                borderRadius: 10,
                padding: 20,
                display: 'flex',
                gap: 16,
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  fontFamily: '"DM Serif Display", serif',
                  fontSize: 36,
                  color: 'var(--cyan)',
                  lineHeight: 1,
                  minWidth: 36,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div style={{ color: 'var(--text-primary)', lineHeight: 1.65, fontSize: 14, paddingTop: 4 }}>
                {rec}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Separate component to allow hover state for the avg marker tooltip
const AvgMarker: React.FC<{ avg: number; riskKey: string }> = ({ avg, riskKey }) => {
  const [showTip, setShowTip] = useState(false)
  return (
    <div
      style={{
        position: 'absolute',
        left: `${avg}%`,
        top: -3,
        transform: 'translateX(-50%)',
        width: 2,
        height: 16,
        backgroundColor: 'rgba(255,255,255,0.6)',
        cursor: 'pointer',
        zIndex: 2,
      }}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      {showTip && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#1a2540',
            border: '1px solid var(--slate-light)',
            borderRadius: 6,
            padding: '6px 10px',
            fontSize: 11,
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            zIndex: 10,
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}
        >
          Industry average for {riskKey.replace('_', ' ')} risk: {avg}/100
        </div>
      )}
    </div>
  )
}

export default FeasibilityReportTab
