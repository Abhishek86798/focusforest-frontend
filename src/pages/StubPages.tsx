import Sidebar from '../components/Sidebar';

const DARK = '#1A1A1A';
const BG = '#F2F2F2';

function PlaceholderPage({ title, emoji }: { title: string; emoji: string }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: BG }}>
      <Sidebar activePage="dashboard" />
      <main style={{
        marginLeft: '101px', flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '16px',
      }}>
        <span style={{ fontSize: '48px' }}>{emoji}</span>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700, fontSize: '22px', color: DARK, opacity: 0.35,
          letterSpacing: '-0.01em',
        }}>
          {title} — Coming Soon
        </span>
      </main>
    </div>
  );
}

export function SessionPage()     { return <PlaceholderPage title="Session Timer"  emoji="⏱️" />; }
