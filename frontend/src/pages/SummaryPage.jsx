import { useNavigate } from 'react-router-dom'

const SUMMARY = {
  tripDetails: {
    destination: 'Zambales',
    hotel: 'Blue Rock Beach Resort',
    startDate: 'June 14, 2025',
    endDate: 'June 16, 2025',
    startTime: '08:00 AM',
    maxAttractions: 4,
  },
  preferences: {
    budget: 'Balanced',
    pace: 'Moderate',
    interests: ['Photography', 'Local Food', 'Swimming'],
  },
  attractions: [
    { id: 1, name: 'Anawangin Cove', duration: '3–4 hrs', slot: 'morning' },
    { id: 2, name: 'Capones Island', duration: '2–3 hrs', slot: 'midday' },
    { id: 3, name: 'Iba Fish Market', duration: '1 hr', slot: 'afternoon' },
  ],
  breaks: [
    { id: 1, name: 'Meal break', time: '12:00 PM – 01:00 PM', icon: 'kitchen' },
    { id: 2, name: 'Coffee break', time: '10:30 AM – 10:45 AM', icon: 'coffee' },
  ],
  snapshot: {
    days: 3,
    attractions: 3,
    breaks: 2,
    pace: 'Moderate',
  },
}

const styles = {
  page: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#F9FAFB',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif",
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E5E7EB',
    padding: '28px 40px 24px',
  },
  headerTitle: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 6px',
  },
  headerSub: {
    fontSize: '14px',
    color: '#6B7280',
    lineHeight: 1.6,
    margin: 0,
  },
  body: {
    padding: '28px 40px',
    maxWidth: '1060px',
    margin: '0 auto',
  },
  main: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: '20px',
    alignItems: 'start',
  },
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '16px',
  },
  cardHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '11px 18px',
    borderBottom: '1px solid #E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  cardHeadLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cardHeadTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#111827',
    margin: 0,
  },
  editBtn: {
    fontSize: '12px',
    color: '#1D4ED8',
    backgroundColor: '#EFF6FF',
    border: '1px solid #BFDBFE',
    borderRadius: '6px',
    cursor: 'pointer',
    padding: '3px 10px',
    fontWeight: 500,
    fontFamily: 'inherit',
  },
  cardBody: {
    padding: '14px 18px',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0 28px',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '7px 0',
    borderBottom: '1px solid #F3F4F6',
  },
  rowLast: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '7px 0',
  },
  rowLabel: {
    fontSize: '13px',
    color: '#6B7280',
  },
  rowVal: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#111827',
  },
  tagsWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    justifyContent: 'flex-end',
  },
  tag: {
    fontSize: '11px',
    backgroundColor: '#EFF6FF',
    color: '#1E40AF',
    padding: '2px 9px',
    borderRadius: '999px',
    fontWeight: 600,
  },
  attGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '10px',
  },
  attChip: {
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    border: '1px solid #E5E7EB',
  },
  attNum: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    backgroundColor: '#1D4ED8',
    color: 'white',
    fontSize: '11px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '1px',
  },
  attName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#111827',
    margin: '0 0 2px',
  },
  attDetail: {
    fontSize: '11px',
    color: '#6B7280',
    margin: 0,
  },
  breakRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '7px 0',
    borderBottom: '1px solid #F3F4F6',
  },
  breakRowLast: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '7px 0',
  },
  breakIcon: {
    width: '32px',
    height: '32px',
    backgroundColor: '#EFF6FF',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: '16px',
  },
  breakName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#111827',
    margin: '0 0 2px',
  },
  breakTime: {
    fontSize: '12px',
    color: '#6B7280',
    margin: 0,
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  sumHead: {
    padding: '13px 18px',
    borderBottom: '1px solid #E5E7EB',
    backgroundColor: '#1D4ED8',
  },
  sumHeadTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#FFFFFF',
    margin: '0 0 1px',
  },
  sumHeadSub: {
    fontSize: '12px',
    color: '#BFDBFE',
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    padding: '14px 18px 6px',
  },
  stat: {
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    padding: '10px 12px',
  },
  statLabel: {
    fontSize: '11px',
    color: '#6B7280',
    marginBottom: '3px',
    fontWeight: 500,
  },
  statVal: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#1D4ED8',
    margin: 0,
  },
  statValSm: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1D4ED8',
    margin: 0,
  },
  sumBody: {
    padding: '10px 18px 14px',
    display: 'flex',
    flexDirection: 'column',
  },
  sumRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    borderBottom: '1px solid #F3F4F6',
  },
  sumRowLast: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
  },
  sumLabel: {
    fontSize: '12px',
    color: '#6B7280',
  },
  sumVal: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#111827',
  },
  notice: {
    backgroundColor: '#EFF6FF',
    border: '1px solid #BFDBFE',
    borderRadius: '10px',
    padding: '12px 14px',
    display: 'flex',
    gap: '10px',
  },
  noticeText: {
    fontSize: '12px',
    color: '#1E40AF',
    lineHeight: 1.6,
    fontWeight: 500,
    margin: 0,
  },
  btnGen: {
    width: '100%',
    padding: '14px',
    borderRadius: '10px',
    backgroundColor: '#1D4ED8',
    color: 'white',
    border: 'none',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'inherit',
  },
  btnBack: {
    width: '100%',
    padding: '11px',
    borderRadius: '10px',
    border: '1px solid #D1D5DB',
    color: '#6B7280',
    backgroundColor: 'transparent',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginTop: '8px',
  },
}

function SectionCard({ icon, title, onEdit, children }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHead}>
        <div style={styles.cardHeadLeft}>
          <span style={{ fontSize: '16px' }}>{icon}</span>
          <p style={styles.cardHeadTitle}>{title}</p>
        </div>
        <button style={styles.editBtn} onClick={onEdit}>Edit</button>
      </div>
      <div style={styles.cardBody}>{children}</div>
    </div>
  )
}

function InfoRow({ label, value, last = false }) {
  return (
    <div style={last ? styles.rowLast : styles.row}>
      <span style={styles.rowLabel}>{label}</span>
      <span style={styles.rowVal}>{value}</span>
    </div>
  )
}

export default function ReviewPage() {
  const navigate = useNavigate()
  const { tripDetails, preferences, attractions, breaks, snapshot } = SUMMARY

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Review your trip</h1>
        <p style={styles.headerSub}>
          Everything look good? You can edit any section before we generate your itinerary.
        </p>
      </div>

      <div style={styles.body}>
        <div style={styles.main}>

          {/* Left column */}
          <div>
            <SectionCard icon="📍" title="Trip details" onEdit={() => navigate('/trip-details')}>
              <div style={styles.twoCol}>
                <div>
                  <InfoRow label="Destination" value={tripDetails.destination} />
                  <InfoRow label="Hotel / Base" value={tripDetails.hotel} />
                  <InfoRow label="Start date" value={tripDetails.startDate} last />
                </div>
                <div>
                  <InfoRow label="End date" value={tripDetails.endDate} />
                  <InfoRow label="Start time" value={tripDetails.startTime} />
                  <InfoRow label="Max attractions" value={`${tripDetails.maxAttractions} per day`} last />
                </div>
              </div>
            </SectionCard>

            <SectionCard icon="⚙️" title="Preferences" onEdit={() => navigate('/preferences')}>
              <div style={styles.twoCol}>
                <div>
                  <InfoRow label="Budget" value={preferences.budget} />
                  <InfoRow label="Trip pace" value={preferences.pace} last />
                </div>
                <div>
                  <div style={{ ...styles.rowLast, alignItems: 'flex-start', paddingTop: '8px' }}>
                    <span style={styles.rowLabel}>Interests</span>
                    <div style={styles.tagsWrap}>
                      {preferences.interests.map((interest) => (
                        <span key={interest} style={styles.tag}>{interest}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard icon="🗺️" title="Attractions" onEdit={() => navigate('/attractions')}>
              <div style={styles.attGrid}>
                {attractions.map((att) => (
                  <div key={att.id} style={styles.attChip}>
                    <div style={styles.attNum}>{att.id}</div>
                    <div>
                      <p style={styles.attName}>{att.name}</p>
                      <p style={styles.attDetail}>{att.duration} · {att.slot}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard icon="☕" title="Breaks" onEdit={() => navigate('/break')}>
              {breaks.map((b, idx) => (
                <div key={b.id} style={idx === breaks.length - 1 ? styles.breakRowLast : styles.breakRow}>
                  <div style={styles.breakIcon}>
                    {b.icon === 'kitchen' ? '🍽️' : '☕'}
                  </div>
                  <div>
                    <p style={styles.breakName}>{b.name}</p>
                    <p style={styles.breakTime}>{b.time}</p>
                  </div>
                </div>
              ))}
            </SectionCard>
          </div>

          {/* Sidebar */}
          <div style={styles.sidebar}>
            <div style={styles.summaryCard}>
              <div style={styles.sumHead}>
                <p style={styles.sumHeadTitle}>Trip snapshot</p>
                <span style={styles.sumHeadSub}>
                  {tripDetails.destination} · {tripDetails.startDate.split(',')[0].split(' ').slice(0, 2).join(' ')}–{tripDetails.endDate.split(',')[0].split(' ')[1]}, {tripDetails.startDate.split(', ')[1]}
                </span>
              </div>
              <div style={styles.statGrid}>
                <div style={styles.stat}>
                  <p style={styles.statLabel}>Days</p>
                  <p style={styles.statVal}>{snapshot.days}</p>
                </div>
                <div style={styles.stat}>
                  <p style={styles.statLabel}>Attractions</p>
                  <p style={styles.statVal}>{snapshot.attractions}</p>
                </div>
                <div style={styles.stat}>
                  <p style={styles.statLabel}>Breaks</p>
                  <p style={styles.statVal}>{snapshot.breaks}</p>
                </div>
                <div style={styles.stat}>
                  <p style={styles.statLabel}>Pace</p>
                  <p style={styles.statValSm}>{snapshot.pace}</p>
                </div>
              </div>
              <div style={styles.sumBody}>
                <div style={styles.sumRow}><span style={styles.sumLabel}>Start date</span><span style={styles.sumVal}>{tripDetails.startDate}</span></div>
                <div style={styles.sumRow}><span style={styles.sumLabel}>End date</span><span style={styles.sumVal}>{tripDetails.endDate}</span></div>
                <div style={styles.sumRow}><span style={styles.sumLabel}>Start time</span><span style={styles.sumVal}>{tripDetails.startTime}</span></div>
                <div style={styles.sumRow}><span style={styles.sumLabel}>Base</span><span style={styles.sumVal}>Blue Rock Resort</span></div>
                <div style={styles.sumRowLast}><span style={styles.sumLabel}>Budget</span><span style={styles.sumVal}>{preferences.budget}</span></div>
              </div>
            </div>

            <div style={styles.notice}>
              <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>✨</span>
              <p style={styles.noticeText}>
                AI will use these details to build a timed itinerary with travel estimates, tips, and suggested routes.
              </p>
            </div>

            <button style={styles.btnGen} onClick={() => navigate('/itinerary')}>
              <span>🪄</span>
              Generate itinerary
            </button>
            <button style={styles.btnBack} onClick={() => navigate('/break')}>
              Back
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}