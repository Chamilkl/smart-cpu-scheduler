'use client'
import { GanttEntry } from '@/lib/types'

interface Props {
  gantt: GanttEntry[]
  totalTime: number
}

const IDLE_COLOR_LIGHT = '#e2e8f0'
const IDLE_COLOR_DARK = '#334155'

export function GanttChart({ gantt, totalTime }: Props) {
  if (!gantt || gantt.length === 0) return null
  const scale = 100 / (totalTime || 1)

  return (
    <div className="space-y-4">
      {/* Gantt Bar */}
      <div className="relative h-14 rounded-xl overflow-hidden flex shadow-inner border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800" style={{ minWidth: '100%' }}>
        {gantt.map((slot, i) => {
          const width = (slot.end - slot.start) * scale
          const isIdle = slot.pid === 'IDLE'
          return (
            <div
              key={i}
              className="relative group flex items-center justify-center text-xs font-bold transition-all border-r border-black/10 dark:border-white/10 last:border-r-0"
              style={{
                width: `${width}%`,
                backgroundColor: isIdle ? undefined : slot.color,
                color: isIdle ? undefined : '#fff',
                minWidth: width < 1 ? '2px' : undefined,
              }}
            >
              {isIdle && (
                <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                  {width > 4 && <span>IDLE</span>}
                </div>
              )}
              {!isIdle && width > 4 && <span className="truncate px-1 drop-shadow-sm">{slot.pid}</span>}
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 whitespace-nowrap pointer-events-none">
                <div className="bg-gray-900 dark:bg-slate-800 text-white dark:text-slate-100 text-xs rounded-xl px-3 py-2 shadow-xl border border-gray-700 dark:border-slate-600">
                  <div className="font-semibold text-indigo-400">{slot.pid}</div>
                  <div className="text-gray-300 dark:text-slate-300">
                    เวลา: {slot.start} → {slot.end} (ระยะเวลา {slot.end - slot.start} ms)
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Time axis */}
      <div className="relative h-6 text-xs text-gray-400 dark:text-slate-500 font-mono" style={{ minWidth: '100%' }}>
        {gantt.map((slot, i) => (
          <span key={i} className="absolute" style={{ left: `${slot.start * scale}%`, transform: 'translateX(-50%)' }}>
            {slot.start}
          </span>
        ))}
        <span className="absolute right-0" style={{ transform: 'translateX(50%)' }}>{totalTime}</span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-1">
        {Array.from(new Map(gantt.filter(s => s.pid !== 'IDLE').map(s => [s.pid, s.color]))).map(([pid, color]) => (
          <div key={pid} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
            <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: color }} />
            <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">{pid}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
          <div className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span className="text-xs text-gray-400 dark:text-slate-400">IDLE (ว่าง)</span>
        </div>
      </div>
    </div>
  )
}
