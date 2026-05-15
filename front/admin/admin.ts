interface Stats {
  totalSpins: number;
  totalBet: number;
  totalPaid: number;
  rtp: number;
  bigWins: number;
  biggestWin: number;
}

interface HistoryEntry {
  id: number;
  createdAt: string;
  bet: number;
  totalWin: number;
  multiplier: number;
  tier: string;
}

const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ||
  'http://localhost:8000';

const REFRESH_MS = 3000;

const fmt = new Intl.NumberFormat('en-US');

function $(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`missing element: ${id}`);
  return el;
}

async function fetchJson<T>(path: string): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`);
  if (!r.ok) throw new Error(`${path} → ${r.status}`);
  return (await r.json()) as T;
}

function renderStats(s: Stats) {
  $('stat-spins').textContent = fmt.format(s.totalSpins);
  $('stat-bet').textContent = `$${fmt.format(s.totalBet)}`;
  $('stat-paid').textContent = `$${fmt.format(s.totalPaid)}`;
  $('stat-rtp').textContent = `${s.rtp.toFixed(2)}%`;
  $('stat-bigwins').textContent = fmt.format(s.bigWins);
  $('stat-biggest').textContent = `$${fmt.format(s.biggestWin)}`;
}

function renderHistory(rows: HistoryEntry[]) {
  const tbody = document.querySelector<HTMLTableSectionElement>('#history-table tbody')!;
  tbody.innerHTML = rows
    .map((r) => {
      const dt = new Date(r.createdAt);
      const time = dt.toLocaleString();
      return `
        <tr>
          <td>${r.id}</td>
          <td>${time}</td>
          <td>$${fmt.format(r.bet)}</td>
          <td>$${fmt.format(r.totalWin)}</td>
          <td>${r.multiplier.toFixed(2)}x</td>
          <td class="tier-${r.tier}">${r.tier}</td>
        </tr>`;
    })
    .join('');
}

async function refresh() {
  const status = $('refresh-status');
  status.textContent = 'fetching…';
  try {
    const [stats, history] = await Promise.all([
      fetchJson<Stats>('/stats'),
      fetchJson<HistoryEntry[]>('/history?limit=50'),
    ]);
    renderStats(stats);
    renderHistory(history);
    status.textContent = `live · ${new Date().toLocaleTimeString()}`;
  } catch (err) {
    status.textContent = `error: ${(err as Error).message}`;
  }
}

$('refresh-btn').addEventListener('click', () => refresh());
refresh();
setInterval(refresh, REFRESH_MS);
