import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import {
  fetchPartnerAccount,
  fetchPartnerOrders,
  fetchPartnerStats,
  logoutDeliveryPartner,
  markPartnerOrderDelivered,
  MAX_DELIVERY_PROOF_FILES,
} from '../services/deliveryPartnerApi';

const VIEW_LABELS = {
  overview: 'Overview',
  confirm: 'Confirm delivery',
  orders: 'All orders',
  map: 'Live map',
  you: 'You & activity',
};

const DP_VIEW_STORAGE_KEY = 'goldymart_dp_active_view';

function readStoredPartnerView() {
  try {
    const v = sessionStorage.getItem(DP_VIEW_STORAGE_KEY);
    if (v && Object.prototype.hasOwnProperty.call(VIEW_LABELS, v)) return v;
  } catch {
    /* private mode / blocked storage */
  }
  return 'overview';
}

function DashboardToolbar({ activeNav, onRefresh, onLogout }) {
  const title = VIEW_LABELS[activeNav] || 'Dashboard';
  return (
    <div className="mb-5 flex flex-col gap-3 border-b border-white/[0.08] pb-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-base font-bold tracking-tight text-slate-100 sm:text-lg">{title}</h1>
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/5"
        >
          Refresh
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-lg bg-orange-500/20 px-3 py-1.5 text-xs font-semibold text-orange-300 hover:bg-orange-500/30"
        >
          Log out
        </button>
      </div>
    </div>
  );
}

function formatInr(n) {
  const x = Number(n) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: x % 1 !== 0 ? 1 : 0,
  }).format(x);
}

function formatInrK(n) {
  const x = Number(n) || 0;
  if (x >= 100000) return `₹${(x / 100000).toFixed(1)}L`;
  if (x >= 1000) return `₹${(x / 1000).toFixed(1)}k`;
  return formatInr(x);
}

function initialsFromName(name) {
  const s = String(name || '').trim();
  if (!s) return '?';
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return s.slice(0, 2).toUpperCase();
}

function hashHue(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360} 65% 45%)`;
}

function mapUiStatus(shopStatus) {
  if (shopStatus === 'delivered') return 'delivered';
  if (shopStatus === 'shipped') return 'transit';
  if (shopStatus === 'rejected') return 'cancelled';
  return 'pending';
}

function itemLineSummary(items) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return '—';
  const names = list.slice(0, 2).map((it) => it.name || it.title || 'Item');
  const more = list.length > 2 ? ` +${list.length - 2}` : '';
  return `${names.join(', ')}${more}`;
}

function etaLabel(shopStatus, etaDays) {
  if (shopStatus === 'delivered') return 'Done';
  if (shopStatus === 'rejected') return '—';
  if (shopStatus === 'shipped') return 'Out for delivery';
  const d = Number(etaDays) || 7;
  return `~${d}d`;
}

const STATUS_CONFIG = {
  delivered: { cls: 'bg-emerald-500/20 text-emerald-400', label: 'Delivered' },
  transit: { cls: 'bg-orange-500/20 text-orange-400', label: 'In transit' },
  pending: { cls: 'bg-yellow-500/20 text-yellow-400', label: 'Pending' },
  cancelled: { cls: 'bg-red-500/20 text-red-400', label: 'Cancelled' },
};

/** All orders section: filter keys match mapUiStatus() */
const ALL_ORDERS_FILTERS = [
  { key: 'all', label: 'All', hint: 'Every assigned order' },
  { key: 'pending', label: 'Pending', hint: 'New & approved (not shipped yet)' },
  { key: 'delivered', label: 'Delivered', hint: 'Completed deliveries' },
  { key: 'transit', label: 'In transit', hint: 'Out for delivery' },
  { key: 'cancelled', label: 'Cancelled', hint: 'Rejected orders' },
];

function Header({ onMenuClick, profile, liveError }) {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const ak = initialsFromName(profile?.full_name || profile?.email);

  return (
    <header className="flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.07] bg-[#111827] px-3 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-300 hover:bg-white/10 lg:hidden"
          aria-label="Open menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3" />
            <rect x="9" y="11" width="14" height="10" rx="2" />
            <circle cx="12" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
          </svg>
        </div>
        <span className="truncate text-base font-bold tracking-tight sm:text-lg">
          Deliv<span className="text-orange-500">X</span>
          <span className="hidden sm:inline"> Dashboard</span>
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {liveError ? (
          <span
            className="hidden max-w-[140px] truncate text-[10px] text-red-400 sm:max-w-xs sm:inline"
            title={liveError}
          >
            {liveError}
          </span>
        ) : null}
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-400 sm:px-3 sm:text-xs">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Live
        </div>
        <span className="hidden font-mono text-xs text-slate-400 sm:inline sm:text-sm">{time}</span>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-violet-500 text-[10px] font-bold sm:h-9 sm:w-9 sm:text-xs">
          {ak}
        </div>
      </div>
    </header>
  );
}

function Sidebar({ profile, stats, navOpen, onClose, activeNav, onNavigate, handoverCount }) {
  const mini = [
    {
      label: "Today's assignments",
      value: String(stats?.ordersToday ?? 0),
      valueColor: 'text-orange-500',
      sub: 'New orders today (you)',
      subColor: 'text-slate-400',
    },
    {
      label: 'Delivered revenue',
      value: formatInrK(stats?.revenueTotal ?? 0),
      valueColor: 'text-cyan-400',
      sub: 'Your completed orders',
      subColor: 'text-emerald-400/90',
    },
    {
      label: 'Success rate',
      value: `${(stats?.successRatePercent ?? 0).toFixed(1)}%`,
      valueColor: 'text-emerald-400',
      sub: 'Delivered vs cancelled',
      subColor: 'text-slate-400',
    },
  ];

  const totalOrders = stats?.totalOrders ?? 0;
  const inProg = (stats?.inTransit ?? 0) + (stats?.pending ?? 0);

  const hc = Number(handoverCount) || 0;
  const nav = [
    { key: 'overview', label: 'Overview', badge: null, badgeColor: '' },
    {
      key: 'confirm',
      label: 'Confirm delivery',
      badge: hc > 0 ? String(hc) : '0',
      badgeColor: hc > 0 ? 'bg-cyan-500' : 'bg-slate-600',
    },
    { key: 'orders', label: 'All orders', badge: String(totalOrders), badgeColor: 'bg-orange-500' },
    { key: 'map', label: 'Live map', badge: 'View', badgeColor: 'bg-slate-600' },
    { key: 'you', label: 'You', badge: '1', badgeColor: 'bg-emerald-500' },
  ];

  const asideCls =
    'scrollbar-delivery flex w-56 shrink-0 flex-col gap-5 overflow-y-auto border-r border-white/[0.07] bg-[#111827] py-5 ' +
    'fixed inset-y-0 left-0 z-50 w-56 transition-transform duration-200 lg:static lg:inset-auto lg:z-0 ' +
    (navOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0');

  return (
    <>
      {navOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          aria-label="Close menu"
          onClick={onClose}
        />
      ) : null}
      <aside className={asideCls}>
        <div className="px-4">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Navigation
          </p>
          {nav.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              className={`mb-0.5 flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-all ${
                activeNav === item.key
                  ? 'bg-orange-500/15 text-orange-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span
                  className={`${item.badgeColor} rounded-full px-2 py-0.5 text-[10px] font-bold text-white`}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <div className="px-4">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Quick stats
          </p>
          {mini.map((s) => (
            <div key={s.label} className="mb-2 rounded-xl border border-white/[0.07] bg-[#1a2235] p-3">
              <p className="mb-1 text-[11px] text-slate-400">{s.label}</p>
              <p className={`font-mono text-xl font-bold ${s.valueColor}`}>{s.value}</p>
              <p className={`mt-0.5 text-[11px] ${s.subColor}`}>{s.sub}</p>
            </div>
          ))}
        </div>
        <div className="mt-auto px-4 pb-2">
          <p className="truncate text-[11px] text-slate-500">Signed in as</p>
          <p className="truncate text-sm font-medium text-slate-200">
            {profile?.full_name || profile?.email}
          </p>
          <p className="text-[10px] text-slate-500">Active: {inProg} in progress</p>
        </div>
      </aside>
    </>
  );
}

function MetricCards({ stats }) {
  const total = stats?.totalOrders ?? 0;
  const delivered = stats?.delivered ?? 0;
  const transit = stats?.inTransit ?? 0;
  const revenue = stats?.revenueTotal ?? 0;
  const success = stats?.successRatePercent ?? 0;

  const cards = [
    {
      label: 'Total orders',
      value: String(total),
      valueClass: 'text-orange-500',
      accent: 'bg-orange-500',
      change: `${stats?.ordersToday ?? 0} today`,
      changeColor: 'text-emerald-400',
      sub: 'assigned to you',
      emoji: '📦',
    },
    {
      label: 'Delivered',
      value: String(delivered),
      valueClass: 'text-emerald-400',
      accent: 'bg-emerald-400',
      change: `${success.toFixed(1)}%`,
      changeColor: 'text-emerald-400',
      sub: 'success vs cancelled',
      emoji: '✅',
    },
    {
      label: 'In transit',
      value: String(transit),
      valueClass: 'text-cyan-400',
      accent: 'bg-cyan-400',
      change: 'Shipped',
      changeColor: 'text-cyan-400',
      sub: 'out for delivery',
      emoji: '🛵',
    },
    {
      label: 'Revenue',
      value: formatInrK(revenue),
      valueClass: 'text-violet-400',
      accent: 'bg-violet-400',
      change: formatInr(revenue),
      changeColor: 'text-emerald-400',
      sub: 'delivered orders total',
      emoji: '💰',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((m) => (
        <div key={m.label} className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-[#111827] p-4">
          <div className={`absolute left-0 right-0 top-0 h-0.5 ${m.accent}`} />
          <div className="pointer-events-none absolute right-4 top-4 select-none text-3xl opacity-10">
            {m.emoji}
          </div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{m.label}</p>
          <p className={`mb-2 font-mono text-2xl font-bold leading-none sm:text-3xl ${m.valueClass}`}>{m.value}</p>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className={`font-semibold ${m.changeColor}`}>{m.change}</span>
            <span className="text-slate-500">{m.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function proofFileKey(f) {
  return `${f.name || 'file'}-${f.size}-${f.lastModified}`;
}

/** Merge newly picked files with existing list (dedupe), cap at max — fixes “second pick replaces first”. */
function mergeProofFileLists(existing, picked, max) {
  const prev = Array.isArray(existing) ? existing : [];
  const add = Array.isArray(picked) ? picked : [];
  const seen = new Set(prev.map(proofFileKey));
  const out = [...prev];
  for (const f of add) {
    if (out.length >= max) break;
    const k = proofFileKey(f);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(f);
    }
  }
  return out;
}

/** Shared UI + rules: min 2, max MAX_DELIVERY_PROOF_FILES images before mark-delivered API. */
function PartnerDeliveryProofControls({
  orderId,
  busy,
  files,
  onProofFilesChange,
  onSubmit,
  variant = 'card',
  /** When true, partner can pick files but cannot submit (e.g. order not shipped yet). */
  submitLocked = false,
  lockHint = '',
}) {
  const proofOk = files.length >= 2 && files.length <= MAX_DELIVERY_PROOF_FILES;
  const canClickSubmit = proofOk && !submitLocked;

  const previewUrls = useMemo(() => {
    if (variant !== 'modal' || !files.length) return [];
    return files.map((f) => ({ url: URL.createObjectURL(f), key: proofFileKey(f) }));
  }, [variant, files]);

  useEffect(() => {
    if (variant !== 'modal') return undefined;
    return () => {
      previewUrls.forEach((o) => URL.revokeObjectURL(o.url));
    };
  }, [variant, previewUrls]);

  const handleChange = (e) => {
    const picked = Array.from(e.target.files || []);
    const merged = mergeProofFileLists(files, picked, MAX_DELIVERY_PROOF_FILES);
    onProofFilesChange(orderId, merged);
    e.target.value = '';
  };

  const handleSubmitClick = async () => {
    if (!canClickSubmit || busy) return;
    await onSubmit(orderId, files);
  };

  const inputClass =
    variant === 'compact'
      ? 'mt-1 block w-full max-w-[220px] cursor-pointer text-[10px] text-slate-300 file:mr-1 file:rounded file:border-0 file:bg-slate-700 file:px-1.5 file:py-1 file:text-[10px] file:text-slate-100 hover:file:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50'
      : variant === 'modal'
        ? 'mt-2 block w-full cursor-pointer text-sm text-slate-200 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-600 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-500 disabled:cursor-not-allowed disabled:opacity-50'
        : 'mt-1 block w-full cursor-pointer text-xs text-slate-300 file:mr-2 file:rounded-md file:border-0 file:bg-slate-700 file:px-2 file:py-1.5 file:text-xs file:font-medium file:text-slate-100 hover:file:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50';

  const labelClass =
    variant === 'modal'
      ? 'block text-xs font-medium uppercase tracking-wide text-slate-400'
      : `block ${variant === 'compact' ? 'text-[10px]' : 'text-[11px]'} font-medium text-slate-400`;

  const hintClass =
    variant === 'modal'
      ? 'mt-2 text-sm text-cyan-400/90'
      : variant === 'compact'
        ? 'text-[10px] text-slate-500'
        : 'text-[11px] text-slate-500';

  const wrapClass =
    variant === 'compact' ? 'min-w-[200px] max-w-[260px]' : variant === 'modal' ? 'w-full' : '';

  return (
    <div className={wrapClass}>
      <label className={labelClass}>
        {variant === 'modal'
          ? `Proof photos (min 2 · max ${MAX_DELIVERY_PROOF_FILES})`
          : variant === 'compact'
            ? `Proof photos (min 2 · max ${MAX_DELIVERY_PROOF_FILES})`
            : `Delivery proof photos (min. 2, max ${MAX_DELIVERY_PROOF_FILES})`}
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={busy}
          onChange={handleChange}
          className={inputClass}
        />
      </label>
      <p className={variant === 'modal' ? hintClass : `mt-1 ${hintClass}`}>
        {files.length === 0
          ? 'No file chosen.'
          : `${files.length}/${MAX_DELIVERY_PROOF_FILES} selected`}
        {!proofOk && files.length > 0 && files.length < 2 ? ' — add at least one more.' : ''}
        {files.length >= MAX_DELIVERY_PROOF_FILES ? ' — max reached.' : ''}
      </p>
      {variant === 'modal' && previewUrls.length > 0 ? (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {previewUrls.map((o, i) => (
            <div
              key={o.key || i}
              className="aspect-square overflow-hidden rounded-lg border border-white/10 bg-black/30"
            >
              <img src={o.url} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      ) : null}
      {variant === 'modal' && files.length > 0 && files.length < MAX_DELIVERY_PROOF_FILES ? (
        <p className="mt-2 text-[11px] text-slate-500">
          Use <span className="text-slate-300">Choose files</span> again to add more (keeps existing photos).
        </p>
      ) : null}
      <button
        type="button"
        disabled={busy || !canClickSubmit}
        onClick={handleSubmitClick}
        title={
          submitLocked
            ? lockHint
            : !proofOk
              ? 'Select at least two photos'
              : undefined
        }
        className={
          variant === 'compact'
            ? 'mt-2 w-full max-w-[220px] rounded-md bg-emerald-600 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50'
            : variant === 'modal'
              ? 'mt-4 w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50'
              : 'mt-3 w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50'
        }
      >
        {busy
          ? 'Uploading…'
          : variant === 'card'
            ? 'Submit proof & mark delivered'
            : 'Submit & delivered'}
      </button>
      {submitLocked && lockHint ? (
        <p
          className={`mt-3 ${
            variant === 'modal' ? 'text-xs leading-snug' : variant === 'compact' ? 'text-[9px] leading-snug' : 'text-[10px] leading-snug'
          } text-amber-400/90`}
        >
          {lockHint}
        </p>
      ) : null}
      {variant === 'modal' && !busy && !proofOk && files.length > 0 ? (
        <p className="mt-2 text-[11px] text-slate-500">Need at least 2 photos — add another from Choose files.</p>
      ) : null}
    </div>
  );
}

/** Popup for table row: multi-image proof + submit (same rules as inline controls). */
function PartnerDeliveryProofModal({
  order,
  onClose,
  busy,
  files,
  onProofFilesChange,
  /** @returns {Promise<boolean>} */
  onMarkDelivered,
}) {
  const handleDeliver = async (orderId, fileList) => {
    const ok = await onMarkDelivered(orderId, fileList);
    if (ok) onClose();
  };

  useEffect(() => {
    if (!order) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [order, onClose]);

  if (!order) return null;

  const shippedRow = order.rawStatus === 'shipped';
  const proofLockHint =
    order.rawStatus === 'pending'
      ? 'You can select photos now. Submit unlocks when admin marks order Shipped (shows as In transit). Payment may still be pending.'
      : 'You can select photos now. Submit unlocks when admin marks order Shipped (In transit).';

  const rowBusy = busy;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dp-proof-modal-title"
      onClick={onClose}
    >
      <div
        className="max-h-[min(90vh,640px)] w-full max-w-md overflow-y-auto rounded-2xl border border-cyan-500/25 bg-[#111827] shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#111827]/95 px-4 py-3 backdrop-blur">
          <h2 id="dp-proof-modal-title" className="text-sm font-bold uppercase tracking-wider text-cyan-400">
            Proof / deliver
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={rowBusy}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="p-4 sm:p-5">
          <p className="mb-1 font-mono text-xs text-cyan-400/80">{order.displayId}</p>
          <p className="mb-4 truncate text-sm text-slate-300">{order.item}</p>
          <PartnerDeliveryProofControls
            orderId={order.id}
            busy={rowBusy}
            files={files}
            onProofFilesChange={onProofFilesChange}
            onSubmit={handleDeliver}
            variant="modal"
            submitLocked={!shippedRow}
            lockHint={!shippedRow ? proofLockHint : ''}
          />
        </div>
      </div>
    </div>
  );
}

function ConfirmDeliverySection({
  orders,
  confirmingId,
  proofFilesByOrder,
  onProofFilesChange,
  onMarkDelivered,
}) {
  const shipped = useMemo(() => orders.filter((o) => o.status === 'shipped'), [orders]);

  return (
    <div className="overflow-hidden rounded-xl border border-emerald-500/25 bg-[#111827]">
      <div className="border-b border-white/[0.07] bg-emerald-500/10 px-4 py-3">
        <p className="text-[11px] leading-relaxed text-slate-400">
          Orders marked <span className="font-medium text-orange-300">Shipped</span> by admin appear here. Upload
          <span className="font-medium text-emerald-300"> at least two photos</span> as proof of delivery, then
          mark delivered.
        </p>
      </div>
      <div className="p-4">
        {shipped.length === 0 ? (
          <p className="rounded-lg border border-dashed border-white/10 bg-[#0a0e1a] px-4 py-8 text-center text-sm text-slate-500">
            No orders out for delivery right now. When an order is assigned to you and marked shipped, it will
            show here for confirmation.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {shipped.map((o) => {
              const idShort = String(o.id).replace(/-/g, '').slice(0, 8).toUpperCase();
              const info = o.customerInfo || {};
              const name = info.name || 'Customer';
              const phone = info.phone || '—';
              const addr = [info.address, info.city, info.state, info.pincode].filter(Boolean).join(', ') || '—';
              const busy = String(confirmingId) === String(o.id);
              const proofFiles = proofFilesByOrder[o.id] || [];
              return (
                <li
                  key={o.id}
                  className="flex flex-col rounded-xl border border-white/[0.08] bg-[#1a2235] p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs text-cyan-400">#{idShort}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-100">{name}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-orange-500/20 px-2 py-0.5 text-[10px] font-semibold text-orange-300">
                      Shipped
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    <span className="text-slate-500">Phone:</span> {phone}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400" title={addr}>
                    {addr}
                  </p>
                  <p className="mt-2 font-mono text-xs font-semibold text-slate-200">
                    {formatInr(Number(o.total || 0) * 1.18 + Number(o.deliveryFee || 0))}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-slate-500" title={itemLineSummary(o.items)}>
                    {itemLineSummary(o.items)}
                  </p>
                  <PartnerDeliveryProofControls
                    orderId={o.id}
                    busy={busy}
                    files={proofFiles}
                    onProofFilesChange={onProofFilesChange}
                    onSubmit={onMarkDelivered}
                    variant="card"
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function LiveMap({ profile, expanded }) {
  const area = [profile?.city, profile?.district, profile?.state].filter(Boolean).join(' · ') || 'Your zone';
  const mapBoxStyle = expanded
    ? { minHeight: 320, height: 'min(58vh, 560px)' }
    : { minHeight: 200, height: 'clamp(200px, 35vw, 260px)' };

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#111827]">
      <div className="flex flex-col gap-1 border-b border-white/[0.07] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-semibold">Coverage — live GPS not linked</span>
        <span className="font-mono text-xs text-slate-400">{area}</span>
      </div>
      <div className="relative overflow-hidden bg-[#0d1b2a]" style={mapBoxStyle}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(6,182,212,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.05) 1px,transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
        <div
          className="absolute rounded-sm border-2 border-orange-500"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%,-50%)',
            width: 14,
            height: 14,
            background: 'rgba(249,115,22,0.85)',
            boxShadow: '0 0 0 5px rgba(249,115,22,0.15)',
          }}
        />
        <span
          className="absolute whitespace-nowrap font-mono text-[9px] text-orange-400"
          style={{ left: '50%', top: 'calc(50% + 12px)', transform: 'translateX(-50%)' }}
        >
          BASE / HUB
        </span>
        <div
          className="absolute flex flex-col items-center"
          style={{ left: '62%', top: '38%', transform: 'translate(-50%,-50%)' }}
        >
          <div
            className="absolute animate-ping rounded-full"
            style={{ inset: -6, background: '#10b98144', animationDuration: '2.5s' }}
          />
          <div className="relative z-10 h-3 w-3 rounded-full bg-emerald-400" />
          <span className="mt-1 whitespace-nowrap font-mono text-[9px] text-slate-400">You</span>
        </div>
        <p className="absolute bottom-3 left-3 right-3 text-center text-[10px] text-slate-500 sm:text-left">
          Real-time rider positions will appear here when GPS is connected. Assigned orders load in the table below.
        </p>
      </div>
    </div>
  );
}

function buildOrderRows(orders) {
  return orders.map((o) => {
    const ui = mapUiStatus(o.status);
    const cust = o.customerInfo?.name || 'Customer';
    const idShort = String(o.id).replace(/-/g, '').slice(0, 8).toUpperCase();
    return {
      id: o.id,
      displayId: `#${idShort}`,
      customer: cust,
      avatar: initialsFromName(cust),
      color: hashHue(String(cust) + String(o.id)),
      item: itemLineSummary(o.items),
      rider: 'You',
      uiStatus: ui,
      rawStatus: o.status,
      amount: formatInr(Number(o.total || 0) * 1.18 + Number(o.deliveryFee || 0)),
      eta: etaLabel(o.status, o.deliveryEtaDays),
      deliveryProofImages: Array.isArray(o.deliveryProofImages) ? o.deliveryProofImages : [],
    };
  });
}

function statusDetailLabel(raw) {
  const s = String(raw || '').toLowerCase();
  if (s === 'approved') return 'Approved';
  if (s === 'pending') return 'Pending payment';
  if (s === 'shipped') return 'Shipped';
  if (s === 'delivered') return 'Delivered';
  if (s === 'rejected') return 'Rejected';
  return raw || '—';
}

function AllOrdersSection({
  orders,
  confirmingId,
  proofFilesByOrder,
  onProofFilesChange,
  onMarkDelivered,
}) {
  const [filter, setFilter] = useState('all');
  const [proofModalOrder, setProofModalOrder] = useState(null);

  const rows = useMemo(() => buildOrderRows(orders), [orders]);

  const counts = useMemo(() => {
    const base = { all: rows.length, pending: 0, delivered: 0, transit: 0, cancelled: 0 };
    for (const r of rows) {
      if (r.uiStatus === 'pending') base.pending += 1;
      else if (r.uiStatus === 'delivered') base.delivered += 1;
      else if (r.uiStatus === 'transit') base.transit += 1;
      else if (r.uiStatus === 'cancelled') base.cancelled += 1;
    }
    return base;
  }, [rows]);

  const filtered =
    filter === 'all' ? rows : rows.filter((o) => o.uiStatus === filter);

  const primaryFilters = ALL_ORDERS_FILTERS.filter((f) =>
    ['all', 'pending', 'delivered'].includes(f.key)
  );
  const extraFilters = ALL_ORDERS_FILTERS.filter((f) =>
    ['transit', 'cancelled'].includes(f.key)
  );

  return (
    <>
      <div className="pb-2">
        <div className="overflow-hidden rounded-xl border border-orange-500/25 bg-[#111827]">
          <div className="border-b border-white/[0.07] bg-orange-500/10 px-4 py-3">
            <p className="text-[11px] leading-relaxed text-slate-400">
              Tap <span className="font-medium text-cyan-300">Proof / deliver</span> to open the popup — add multiple
              photos (min 2, max 10) and submit when status is{' '}
              <span className="font-medium text-orange-300">In transit</span>. You can pick files earlier; submit
              stays locked until admin ships. Or use <span className="font-medium text-slate-200">Confirm delivery</span>{' '}
              for shipped orders.
            </p>
          </div>

        <div className="space-y-3 border-b border-white/[0.07] px-4 py-3">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Quick filters
            </p>
            <div className="flex flex-wrap gap-2">
              {primaryFilters.map((t) => {
                const n = counts[t.key] ?? 0;
                const active = filter === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    title={t.hint}
                    onClick={() => setFilter(t.key)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                      active
                        ? 'border-orange-500/50 bg-orange-500/20 text-orange-200'
                        : 'border-white/10 bg-[#1a2235] text-slate-300 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    {t.label}
                    <span
                      className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] ${
                        active ? 'bg-black/25 text-orange-100' : 'bg-black/20 text-slate-400'
                      }`}
                    >
                      {n}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              More filters
            </p>
            <div className="flex flex-wrap gap-2">
              {extraFilters.map((t) => {
                const n = counts[t.key] ?? 0;
                const active = filter === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    title={t.hint}
                    onClick={() => setFilter(t.key)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                      active
                        ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-200'
                        : 'border-white/10 bg-[#1a2235] text-slate-400 hover:border-white/15 hover:text-slate-200'
                    }`}
                  >
                    {t.label}
                    <span
                      className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] ${
                        active ? 'bg-black/25 text-cyan-100' : 'bg-black/20 text-slate-500'
                      }`}
                    >
                      {n}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="-mx-0 overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left">
            <thead>
              <tr>
                {[
                  'Order',
                  'Customer',
                  'Items',
                  'Partner',
                  'Status',
                  'Detail',
                  'Total',
                  'ETA',
                  'Proof / deliver',
                ].map((h) => (
                  <th
                    key={h}
                    className="border-b border-white/[0.07] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:px-4"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-500">
                    No assigned orders yet. Ask admin to assign orders to your partner account.
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-500">
                    No orders match this filter. Try <span className="text-slate-400">All</span> or another status.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const s = STATUS_CONFIG[order.uiStatus];
                  const rowBusy = String(confirmingId) === String(order.id);
                  const raw = order.rawStatus;
                  const deliveredRow = raw === 'delivered';
                  const showProofPicker = raw !== 'rejected' && !deliveredRow;
                  return (
                    <tr key={order.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="border-b border-white/[0.04] px-3 py-2.5 sm:px-4">
                        <span className="font-mono text-xs text-cyan-400">{order.displayId}</span>
                      </td>
                      <td className="border-b border-white/[0.04] px-3 py-2.5 sm:px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                            style={{ background: `${order.color}22`, color: order.color }}
                          >
                            {order.avatar}
                          </div>
                          <span className="max-w-[120px] truncate text-sm sm:max-w-none">{order.customer}</span>
                        </div>
                      </td>
                      <td className="max-w-[140px] truncate border-b border-white/[0.04] px-3 py-2.5 text-sm text-slate-400 sm:max-w-[200px] sm:px-4">
                        {order.item}
                      </td>
                      <td className="border-b border-white/[0.04] px-3 py-2.5 sm:px-4">
                        <span className="rounded-md bg-[#1a2235] px-2 py-1 font-mono text-xs text-slate-400">
                          {order.rider}
                        </span>
                      </td>
                      <td className="border-b border-white/[0.04] px-3 py-2.5 sm:px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold ${s.cls}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {s.label}
                        </span>
                      </td>
                      <td className="border-b border-white/[0.04] px-3 py-2.5 text-[11px] text-slate-500 sm:px-4">
                        {statusDetailLabel(order.rawStatus)}
                      </td>
                      <td className="border-b border-white/[0.04] px-3 py-2.5 font-mono text-xs font-semibold sm:px-4">
                        {order.amount}
                      </td>
                      <td className="border-b border-white/[0.04] px-3 py-2.5 font-mono text-xs text-slate-400 sm:px-4">
                        {order.eta}
                      </td>
                      <td className="border-b border-white/[0.04] px-3 py-2.5 align-top sm:px-4">
                        {showProofPicker ? (
                          <div className="flex flex-col items-start gap-1">
                            <button
                              type="button"
                              onClick={() => setProofModalOrder(order)}
                              disabled={rowBusy}
                              className="rounded-lg border border-cyan-500/45 bg-cyan-500/15 px-3 py-2 text-left text-xs font-semibold text-cyan-300 transition-colors hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Proof / deliver
                            </button>
                            {(proofFilesByOrder[order.id]?.length ?? 0) > 0 ? (
                              <span className="max-w-[140px] text-[10px] leading-snug text-slate-500">
                                {proofFilesByOrder[order.id].length} photo(s) ready
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-600">Tap to add photos</span>
                            )}
                          </div>
                        ) : deliveredRow && order.deliveryProofImages?.length ? (
                          <div className="flex max-w-[220px] flex-wrap gap-1">
                            {order.deliveryProofImages.map((src, i) => (
                              <a
                                key={`${src}-${i}`}
                                href={src}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block overflow-hidden rounded border border-white/10"
                              >
                                <img
                                  src={src}
                                  alt=""
                                  className="h-10 w-10 object-cover"
                                />
                              </a>
                            ))}
                          </div>
                        ) : deliveredRow ? (
                          <span className="text-[10px] leading-snug text-slate-500">Delivered (no photos)</span>
                        ) : (
                          <span className="text-[11px] text-slate-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
      <PartnerDeliveryProofModal
        order={proofModalOrder}
        onClose={() => setProofModalOrder(null)}
        busy={proofModalOrder ? String(confirmingId) === String(proofModalOrder.id) : false}
        files={proofModalOrder ? proofFilesByOrder[proofModalOrder.id] || [] : []}
        onProofFilesChange={onProofFilesChange}
        onMarkDelivered={onMarkDelivered}
      />
    </>
  );
}

const CHART_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

function PartnerInsightsBlocks({ profile, stats, firstSectionId }) {
  const hourly = stats?.hourlyToday ?? Array(24).fill(0);
  const values = CHART_HOURS.map((h) => hourly[h] ?? 0);
  const max = Math.max(1, ...values);
  const labels = CHART_HOURS.map((h) => `${h}`);

  const categories = stats?.categories?.length
    ? stats.categories
    : [{ name: 'No product data yet', value: 0, color: '#64748b' }];

  const maxCat = Math.max(1, ...categories.map((c) => Number(c.value) || 0));

  const activities = stats?.activities ?? [];

  return (
    <>
      <section id={firstSectionId || undefined}>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Your profile</p>
        <div className="flex cursor-default items-center gap-2.5 rounded-xl border border-white/[0.07] bg-[#1a2235] p-3 transition-colors hover:border-orange-500/30">
          <div
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold"
            style={{
              background: `${hashHue(profile?.email || 'x')}22`,
              color: hashHue(profile?.email || 'x'),
            }}
          >
            {initialsFromName(profile?.full_name)}
            <span className="absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full border-2 border-[#1a2235] bg-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold">{profile?.full_name || 'Partner'}</p>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              <span>{profile?.city || '—'}</span>
              {profile?.phone ? <span>{profile.phone}</span> : null}
            </div>
          </div>
          <span className="shrink-0 text-[10px] text-emerald-400">On duty</span>
        </div>
      </section>

      <section>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Hourly orders (today)
        </p>
        <div className="rounded-xl border border-white/[0.07] bg-[#1a2235] p-4">
          <div className="mb-3 flex justify-between text-[11px] text-slate-400">
            <span>Server local day</span>
            <span className="font-mono text-orange-400">8h–17h window</span>
          </div>
          <div className="flex h-20 items-end gap-1">
            {values.map((v, i) => {
              const peakVal = Math.max(...values);
              const isPeak = v > 0 && v === peakVal;
              const h = CHART_HOURS[i];
              const isHigh = h >= 12 && h <= 15;
              const bg = isPeak ? '#f97316' : isHigh ? '#06b6d4' : 'rgba(255,255,255,0.08)';
              return (
                <div key={labels[i]} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <div
                    title={`${v} orders`}
                    className="mx-auto w-full max-w-[28px] cursor-pointer rounded-t transition-opacity hover:opacity-75"
                    style={{
                      height: `${Math.round((v / max) * 100)}%`,
                      background: bg,
                      minHeight: v > 0 ? 4 : 2,
                    }}
                  />
                  <span className="font-mono text-[9px] text-slate-500">{labels[i]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Top items (your orders)
        </p>
        {categories.map((cat) => (
          <div key={cat.name} className="mb-3">
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="truncate text-slate-400">{cat.name}</span>
              <span className="shrink-0 font-mono font-semibold" style={{ color: cat.color }}>
                {cat.value}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.round(((Number(cat.value) || 0) / maxCat) * 100))}%`,
                  background: cat.color,
                }}
              />
            </div>
          </div>
        ))}
      </section>

      <section>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Recent activity</p>
        {activities.length === 0 ? (
          <p className="text-xs text-slate-500">No recent updates.</p>
        ) : (
          activities.map((a, i) => (
            <div
              key={`${a.highlight}-${i}`}
              className={`flex gap-2.5 py-2 ${i < activities.length - 1 ? 'border-b border-white/[0.05]' : ''}`}
            >
              <div className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: a.color }} />
              <div>
                <p className="text-xs leading-relaxed text-slate-400">
                  <span className="font-medium text-slate-200">{a.highlight}</span>
                  {a.text}
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-slate-500">{a.time}</p>
              </div>
            </div>
          ))
        )}
      </section>

      <div className="pt-2">
        <Link
          to="/"
          className="block rounded-lg border border-white/10 py-2.5 text-center text-xs font-semibold text-slate-300 hover:bg-white/5"
        >
          Back to Goldy Mart store
        </Link>
      </div>
    </>
  );
}

function RightPanel({ profile, stats }) {
  return (
    <aside className="scrollbar-delivery flex w-full shrink-0 flex-col gap-5 border-t border-white/[0.07] bg-[#111827] p-4 sm:p-5 lg:max-h-full lg:w-72 lg:min-h-0 lg:overflow-y-auto lg:border-l lg:border-t-0">
      <PartnerInsightsBlocks profile={profile} stats={stats} firstSectionId="dp-sidebar-you" />
    </aside>
  );
}

export default function DeliveryPartnerDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveError, setLiveError] = useState('');
  const [navOpen, setNavOpen] = useState(false);
  const [activeNav, setActiveNav] = useState(readStoredPartnerView);
  const [confirmingId, setConfirmingId] = useState(null);
  const [proofFilesByOrder, setProofFilesByOrder] = useState({});

  const onProofFilesChange = useCallback((orderId, fileList) => {
    setProofFilesByOrder((prev) => ({ ...prev, [orderId]: fileList }));
  }, []);

  const handoverCount = useMemo(
    () => orders.filter((o) => o.status === 'shipped').length,
    [orders]
  );

  const goToView = useCallback((key) => {
    if (!Object.prototype.hasOwnProperty.call(VIEW_LABELS, key)) return;
    setActiveNav(key);
    setNavOpen(false);
    try {
      sessionStorage.setItem(DP_VIEW_STORAGE_KEY, key);
    } catch {
      /* ignore */
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const [ord, st] = await Promise.all([fetchPartnerOrders(), fetchPartnerStats()]);
      setOrders(ord);
      setStats(st);
      setLiveError('');
    } catch (e) {
      setLiveError(e?.message || 'Could not refresh data');
    }
  }, []);

  const handleMarkDelivered = useCallback(
    async (orderId, files) => {
      setConfirmingId(orderId);
      try {
        await markPartnerOrderDelivered(orderId, files);
        setProofFilesByOrder((prev) => {
          const next = { ...prev };
          delete next[orderId];
          return next;
        });
        await refresh();
        return true;
      } catch (e) {
        window.alert(e?.message || 'Could not confirm delivery. Order must be assigned to you and shipped.');
        return false;
      } finally {
        setConfirmingId(null);
      }
    },
    [refresh]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const acc = await fetchPartnerAccount();
        if (cancelled) return;
        if (!acc.is_delivery_partner) {
          logoutDeliveryPartner();
          navigate('/partner-login', { replace: true });
          return;
        }
        setProfile(acc);
        await refresh();
      } catch {
        if (!cancelled) {
          logoutDeliveryPartner();
          navigate('/partner-login', { replace: true });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, refresh]);

  useEffect(() => {
    if (!profile) return undefined;
    const id = setInterval(refresh, 8000);
    return () => clearInterval(id);
  }, [profile, refresh]);

  const handleLogout = () => {
    logoutDeliveryPartner();
    navigate('/partner-login', { replace: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0e1a]">
        <p className="text-sm text-slate-400">Loading dashboard…</p>
      </div>
    );
  }

  if (!profile) return null;

  const shellStats =
    stats ||
    ({
      totalOrders: 0,
      delivered: 0,
      inTransit: 0,
      pending: 0,
      cancelled: 0,
      revenueTotal: 0,
      successRatePercent: 0,
      hourlyToday: Array(24).fill(0),
      ordersToday: 0,
      categories: [],
      activities: [],
    });

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0a0e1a] font-display text-slate-100">
      <SEOHead
        title="Delivery dashboard — Goldy Mart"
        description="Delivery partner workspace — assigned orders and stats"
        url="https://www.goldymart.com/delivery-dashboard"
      />
      <Header onMenuClick={() => setNavOpen(true)} profile={profile} liveError={liveError} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          profile={profile}
          stats={shellStats}
          navOpen={navOpen}
          onClose={() => setNavOpen(false)}
          activeNav={activeNav}
          onNavigate={goToView}
          handoverCount={handoverCount}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#0a0e1a] lg:flex-row lg:overflow-hidden">
          <div className="scrollbar-delivery min-h-0 flex-1 overflow-y-auto p-3 sm:p-5 lg:min-h-0">
            <DashboardToolbar
              activeNav={activeNav}
              onRefresh={refresh}
              onLogout={handleLogout}
            />
            {activeNav === 'overview' ? <MetricCards stats={shellStats} /> : null}
            {activeNav === 'confirm' ? (
              <ConfirmDeliverySection
                orders={orders}
                confirmingId={confirmingId}
                proofFilesByOrder={proofFilesByOrder}
                onProofFilesChange={onProofFilesChange}
                onMarkDelivered={handleMarkDelivered}
              />
            ) : null}
            {activeNav === 'orders' ? (
              <AllOrdersSection
                orders={orders}
                confirmingId={confirmingId}
                proofFilesByOrder={proofFilesByOrder}
                onProofFilesChange={onProofFilesChange}
                onMarkDelivered={handleMarkDelivered}
              />
            ) : null}
            {activeNav === 'map' ? <LiveMap profile={profile} expanded /> : null}
            {activeNav === 'you' ? (
              <div className="mx-auto w-full max-w-3xl space-y-6 pb-6">
                <PartnerInsightsBlocks profile={profile} stats={shellStats} />
              </div>
            ) : null}
          </div>
          {activeNav === 'overview' ? (
            <RightPanel profile={profile} stats={shellStats} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
