// ─── Design tokens ─────────────────────────────────────────────────────────────
const DARK = '#1A1A1A';
const WHITE = '#F2F2F2';
const SUPER_WHITE = '#FAFAFA';
const GREEN = '#006D37';
const SHADOW = `8px 8px 0px 0px ${DARK}`;
const BUTTON_SHADOW = `4px 4px 0px 0px ${DARK}`;

export interface DayDetailProps {
  dateStr?: string;
  sessionsCount?: number;
  variantUsed?: string;
  tasksSet?: string;
  taskOutcomes?: string;
  onClose?: () => void;
}

export default function DayDetailPanel({
  dateStr = '28th March 2026',
  sessionsCount = 3,
  variantUsed = 'Classic Timer',
  tasksSet = 'None',
  taskOutcomes = 'None',
  onClose
}: DayDetailProps) {
  return (
    <div style={{
      width: '474px',
      background: WHITE,
      border: `2px solid ${DARK}`,
      boxShadow: SHADOW,
      padding: '37px 31px 40px',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box'
    }}>
      
      {/* ── Header ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          fontSize: '12px',
          color: DARK
        }}>
          Session Details
        </span>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline'
        }}>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '24px',
            color: DARK
          }}>
            {dateStr}
          </span>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: '12px',
            color: DARK
          }}>
            Solo
          </span>
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{
        width: '100%',
        height: '2px',
        background: DARK,
        opacity: 0.2,
        marginTop: '25px', // y: 117 approximately
        marginBottom: '25px'
      }} />

      {/* ── Stats List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '43px' }}>
        <StatRow label="sessions count" value={sessionsCount.toString()} />
        <StatRow label="variant used" value={variantUsed} />
        <StatRow label="tasks set" value={tasksSet} />
        <StatRow label="task outcomes" value={taskOutcomes} />
      </div>

      {/* ── Close Button ── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '60px' }}>
        <button
          onClick={onClose}
          className="transition-all duration-200 ease-out active:scale-[0.97] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '10px 24px',
            background: GREEN,
            border: `2px solid ${DARK}`,
            boxShadow: BUTTON_SHADOW,
            cursor: 'pointer',
          }}
        >
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 500,
            fontSize: '20px',
            color: SUPER_WHITE
          }}>
            Close
          </span>
          
          {/* Close SVG Icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2L2 14M2 2L14 14" stroke={SUPER_WHITE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <span style={{
        fontFamily: "'Inter', sans-serif",
        fontWeight: 700,
        fontSize: '16px',
        color: DARK,
        textTransform: 'capitalize'
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: "'Inter', sans-serif",
        fontWeight: 400,
        fontSize: '16px',
        color: DARK,
        textAlign: 'right'
      }}>
        {value}
      </span>
    </div>
  );
}
