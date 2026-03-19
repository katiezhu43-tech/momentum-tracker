import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const WEEK_DAYS = ['日','一','二','三','四','五','六']

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function Calendar({ startDate, endDate, calendarData, onDayClick }) {
  const today = new Date(); today.setHours(0,0,0,0)
  const start = startDate ? new Date(startDate + 'T00:00:00') : null
  const end   = endDate   ? new Date(endDate   + 'T00:00:00') : null
  const initMonth = start ? new Date(start.getFullYear(), start.getMonth(), 1)
                          : new Date(today.getFullYear(), today.getMonth(), 1)
  const [viewMonth, setViewMonth] = useState(initMonth)
  const year = viewMonth.getFullYear(), month = viewMonth.getMonth()
  const minMonth = start ? new Date(start.getFullYear(), start.getMonth(), 1) : null
  const maxMonth = end   ? new Date(end.getFullYear(), end.getMonth(), 1)
                         : new Date(today.getFullYear(), today.getMonth(), 1)
  const canPrev = minMonth ? viewMonth > minMonth : true
  const canNext = viewMonth < maxMonth

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

  const colorMap = { purple:'#C084FC', blue:'#93C5FD', green:'#86EFAC', yellow:'#FDE68A' }

  return (
    <div className="border border-gray-100 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => canPrev && setViewMonth(new Date(year, month-1, 1))}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${canPrev ? 'text-gray-400 hover:bg-gray-100' : 'text-gray-200'}`}>
          <ChevronLeft size={18} />
        </button>
        <span className="text-base text-gray-500">{year}年{month+1}月</span>
        <button onClick={() => canNext && setViewMonth(new Date(year, month+1, 1))}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${canNext ? 'text-gray-400 hover:bg-gray-100' : 'text-gray-200'}`}>
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-3">
        {WEEK_DAYS.map(w => <div key={w} className="text-center text-xs text-gray-300 py-1">{w}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-2">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />
          const ds = toDateStr(day)
          const isToday = ds === toDateStr(today)
          const isFuture = day > today
          const beforeStart = start && day < start
          if (isFuture) return <div key={ds} />
          const dots = calendarData?.[ds]
            ? Object.entries(calendarData[ds]).filter(([,v]) => v > 0).map(([k]) => k)
            : []
          return (
            <button key={ds} onClick={() => !beforeStart && onDayClick(ds)} disabled={!!beforeStart}
              className={`flex flex-col items-center justify-center rounded-xl py-2 text-sm transition-colors
                ${isToday ? 'bg-gray-900 text-white' : ''}
                ${!isToday && !beforeStart ? 'text-gray-600 hover:bg-gray-50' : ''}
                ${beforeStart ? 'text-gray-200 cursor-default' : ''}
              `}>
              <span>{day.getDate()}</span>
              {dots.length > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {dots.slice(0,4).map(k => <span key={k} className="w-1.5 h-1.5 rounded-full" style={{background: colorMap[k]}} />)}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function GoalsTab({ goals, startDate, endDate, calendarData, onGoalsChange, onStartChange, onEndChange, onDayClick }) {
  const [localGoals, setLocalGoals] = useState(goals)

  function handleGoalBlur(i, val) {
    const next = [...localGoals]; next[i] = val
    setLocalGoals(next); onGoalsChange(next)
  }

  function handleStartChange(val) {
    if (!val) return
    if (!window.confirm('修改开始日期将清空所有历史数据，确认继续？')) return
    onStartChange(val)
  }

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 w-full max-w-4xl mx-auto">

      {/* 目标 - 横排三列 */}
      <section>
        <p className="text-[11px] text-gray-300 uppercase tracking-widest mb-4">目标</p>
        <div className="grid grid-cols-3 gap-4">
          {[0,1,2].map(i => (
            <input key={i}
              className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-200 outline-none focus:border-gray-300 transition-colors"
              placeholder={`目标 ${i+1}`} maxLength={50}
              defaultValue={localGoals[i] || ''}
              onBlur={e => handleGoalBlur(i, e.target.value)}
            />
          ))}
        </div>
      </section>

      {/* 周期 */}
      <section>
        <p className="text-[11px] text-gray-300 uppercase tracking-widest mb-4">周期</p>
        <div className="flex gap-4">
          {[
            { label: '开始', value: startDate, onChange: handleStartChange },
            { label: '结束', value: endDate,   onChange: onEndChange },
          ].map(f => (
            <div key={f.label} className="flex-1 flex flex-col gap-1">
              <label className="text-[11px] text-gray-300">{f.label}</label>
              <input type="date"
                className="w-full bg-transparent border-b border-gray-100 py-2 text-sm text-gray-600 outline-none focus:border-gray-300 transition-colors"
                value={f.value} onChange={e => f.onChange(e.target.value)} />
            </div>
          ))}
        </div>
      </section>

      {/* 日历 */}
      {startDate
        ? <Calendar startDate={startDate} endDate={endDate} calendarData={calendarData} onDayClick={onDayClick} />
        : <p className="text-sm text-gray-200 text-center py-8">设置开始日期后显示日历</p>
      }
    </div>
  )
}
