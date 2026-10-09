'use client'

// Owner: B
// The employee's own clock page. Reached at /employee/<id> so the login form's
// `redirectTo + '/' + id` redirect works unchanged.
//
// - Status card: "Clocked in since 09:02" with a running timer, or "Clocked out".
// - Clock In / Clock Out: only one enabled at a time, driven by the live status.
//   The buttons are just convenience — every rule is enforced by the server.
// - Personal QR: encodes this page's URL; scanning it from a phone clocks the
//   employee in/out (the server decides which). No expiring token — accepted
//   trade-off for this assignment.
// - Timesheet: every shift grouped by day plus weekly totals computed by the DB.

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  CalendarDays,
  Clock,
  ClockCheck,
  ClockPlus,
  Loader2,
} from 'lucide-react'
import type {
  ClockStatus,
  Timesheet,
  TimesheetShift,
  WeekTotal,
} from '@/types'

function ClockButton({
  active,
  loading,
  label,
  onClick,
  tone,
}: {
  active: boolean
  loading: boolean
  label: string
  onClick: () => void
  tone: 'in' | 'out'
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-[10px] px-5 py-[13px] font-bold transition disabled:cursor-not-allowed'
  const current =
    tone === 'in'
      ? 'bg-(--forest) text-white hover:bg-[#0a4b47] shadow-[0_5px_14px_rgba(16,63,61,0.17)]'
      : 'bg-(--orange) text-white hover:bg-[#c4632f]'
  const disabled =
    'bg-(--mint) text-(--ink-soft) opacity-70'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!active || loading}
      className={`${base} ${active ? current : disabled}`}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        tone === 'in' ? <ClockPlus size={16} /> : <ClockCheck size={16} />
      )}
      {label}
    </button>
  )
}

function LiveTimer({ since, on }: { since: string | null; on: boolean }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    if (!on) return
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [on])

  if (!on || !since) return null

  const start = new Date(since).getTime()
  let ms = Math.max(0, now.getTime() - start)
  const h = Math.floor(ms / 3_600_000)
  ms -= h * 3_600_000
  const m = Math.floor(ms / 60_000)
  ms -= m * 60_000
  const s = Math.floor(ms / 1000)
  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    <span className="font-mono tabular-nums">
      {h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`}
    </span>
  )
}

function formatElapsed(
  startDay: string,
  clockInRaw: string,
  clockOutRaw: string | null,
) {
  const start = new Date(clockInRaw)
  const end = clockOutRaw ? new Date(clockOutRaw) : new Date()
  let total = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000))
  const h = Math.floor(total / 60)
  total -= h * 60
  void startDay
  return `${h ? `${h}h ` : ''}${total}m`
}

// Data loaders. The setters are passed in (instead of calling
// setState from a useCallback inside the component) so the mount
// effect only wires them up — no synchronous setState in the effect.
async function loadStatus(setStatus: (s: ClockStatus) => void) {
  try {
    const res = await fetch('/api/clock/status', { cache: 'no-store' })
    if (!res.ok) return
    setStatus((await res.json()) as ClockStatus)
  } catch {
    /* transient */
  }
}

async function loadTimesheet(setTimesheet: (t: Timesheet | null) => void) {
  try {
    const res = await fetch('/api/timesheet', { cache: 'no-store' })
    if (!res.ok) return
    setTimesheet((await res.json()) as Timesheet)
  } catch {
    /* transient */
  }
}

export default function EmployeeClockPage() {
  const params = useParams<{ id: string }>()
  const empId: string = (params?.id as string | undefined) ?? ''
  const origin =
    typeof window !== 'undefined' ? window.location.origin : ''
  const qrData = `${origin}/employee/${empId}`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=190x190&color=103f3d&data=${encodeURIComponent(
    qrData,
  )}`

  const [status, setStatus] = useState<ClockStatus>({ clockedIn: false, clockIn: null })
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null)
  const [action, setAction] = useState<'in' | 'out' | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Initial load.
  useEffect(() => {
    void loadStatus(setStatus)
    void loadTimesheet(setTimesheet)
  }, [])

  async function doAction(kind: 'in' | 'out') {
    setError(null)
    setAction(kind)
    try {
      const res = await fetch(`/api/clock/${kind}`, { method: 'POST' })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? `Could not ${kind === 'in' ? 'clock in' : 'clock out'}`)
        return
      }
      await loadStatus(setStatus)
      await loadTimesheet(setTimesheet)
    } catch {
      setError('Could not reach the server. Please try again.')
    } finally {
      setAction(null)
    }
  }

  const days = useMemo(() => {
    if (!timesheet) return []
    const byDay = new Map<string, TimesheetShift[]>()
    for (const s of timesheet.shifts) {
      const arr = byDay.get(s.startDay) ?? []
      arr.push(s)
      byDay.set(s.startDay, arr)
    }
    return [...byDay.entries()].map(([day, shifts]) => ({ day, shifts }))
  }, [timesheet])

  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-5 py-8 sm:py-12">
      {/* Status card */}
      <section
        className={
          'mb-8 rounded-2xl border p-5 sm:p-6 shadow-[0_12px_40px_rgba(17,50,49,0.08)] ' +
          (status.clockedIn
            ? 'border-[#b6ded1] bg-(--mint-light)'
            : 'border-(--line) bg-white')
        }
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] text-(--forest-2)">
              <span
                className={`size-2 rounded-full ${status.clockedIn ? 'bg-emerald-500' : 'bg-zinc-400'}`}
              />
              {status.clockedIn ? 'CLOCKED IN' : 'CLOCKED OUT'}
            </div>
            <h1 className="font-display text-[28px] font-extrabold leading-tight text-(--ink)">
              {status.clockedIn
                ? 'Clocked in since '
                : 'You are clocked out'}
              {status.clockedIn && (
                // Clock-in time is rendered by the server in the company tz
                // string; just show the HH:MM part + the running timer.
                <span className="text-(--forest-2)">
                  {status.clockIn?.includes(' ')
                    ? status.clockIn.slice(-5)
                    : status.clockIn}
                </span>
              )}
            </h1>
            {status.clockedIn && (
              <p className="mt-1 text-sm text-(--ink-soft)">
                Running for{' '}
                <LiveTimer since={status.clockIn} on />
              </p>
            )}
            {error && (
              <p role="alert" className="mt-2 text-xs font-semibold text-[#b74a3f]">
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-3 sm:flex-col lg:flex-row">
            <ClockButton
              active={!status.clockedIn}
              loading={action === 'in'}
              label="Clock in"
              onClick={() => void doAction('in')}
              tone="in"
            />
            <ClockButton
              active={status.clockedIn}
              loading={action === 'out'}
              label="Clock out"
              onClick={() => void doAction('out')}
              tone="out"
            />
          </div>
        </div>
      </section>

      {/* Personal QR */}
      <section className="mb-8 rounded-2xl border border-(--line) bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <img
            src={qrUrl}
            alt="Personal clock QR"
            width={190}
            height={190}
            className="size-[160px] shrink-0 rounded-lg bg-white"
            loading="lazy"
          />
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-(--ink)">
              <Clock size={18} className="text-(--forest-2)" /> Personal QR
            </h2>
            <p className="mt-1 text-[13px] leading-6 text-(--ink-soft)">
              Show this code on the office display. A scan on your phone clocks
              you in or out — whichever applies — without a second login.
            </p>
            <p className="mt-2 break-all text-[11px] font-mono text-(--ink-soft)/80">
              {qrData}
            </p>
          </div>
        </div>
      </section>

      {/* Timesheet */}
      <section className="rounded-2xl border border-(--line) bg-white p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-(--ink)">
            <CalendarDays size={18} className="text-(--forest-2)" /> Your timesheet
          </h2>
          {timesheet && (
            <span className="text-[11px] font-semibold text-(--ink-soft)">
              Last 52 weeks · totals computed by the database
            </span>
          )}
        </div>

        {!timesheet ? (
          <div className="flex items-center gap-2 text-sm text-(--ink-soft)">
            <Loader2 size={14} className="animate-spin" /> Loading…
          </div>
        ) : timesheet.shifts.length === 0 ? (
          <p className="text-sm text-(--ink-soft)">
            No shifts recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            {/* Day-grouped rows */}
            <div className="divide-y divide-(--line) text-sm">
              {days.map(({ day, shifts }) => (
                <div key={day} className="py-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-[0.1em] text-(--forest-2)">
                      {new Date(day + 'T00:00:00').toLocaleDateString('en-GB', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-[11px] font-semibold text-(--ink-soft)">
                      {shifts.reduce(
                        (sum, s) => sum + (s.durationMinutes ?? 0),
                        0,
                      )} min
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {shifts.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between rounded-md bg-(--cream) px-3 py-2"
                      >
                        <span className="font-mono tabular-nums text-xs">
                          {s.clockIn}
                          {s.clockOut ? ` → ${s.clockOut}` : ' → (open)'}
                        </span>
                        <span className="text-xs font-semibold text-(--ink-soft)">
                          {formatElapsed(s.startDay, s.clockIn, s.clockOut)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Weekly totals, newest first, capped to keep the view lean. */}
            <div className="mt-5 border-t border-(--line) pt-4">
              <h3 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-(--forest-2)">
                WEEKLY TOTALS
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                {timesheet.weeks.slice(0, 12).map((w: WeekTotal) => (
                  <div
                    key={w.weekStart}
                    className="rounded-lg border border-(--line) bg-(--cream) px-3 py-2.5"
                  >
                    <div className="text-[11px] font-semibold text-(--ink-soft)">
                      Wk of{' '}
                      {new Date(w.weekStart + 'T00:00:00').toLocaleDateString(
                        'en-GB',
                        { day: '2-digit', month: 'short' },
                      )}
                    </div>
                    <div className="mt-1 text-lg font-bold text-(--ink)">
                      {(() => {
                        const h = Math.floor(w.minutes / 60)
                        const m = w.minutes % 60
                        return `${h}h ${m.toString().padStart(2, '0')}m`
                      })()}
                    </div>
                    <div className="text-[11px] text-(--ink-soft)">
                      {w.shifts} shift{w.shifts === 1 ? '' : 's'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
