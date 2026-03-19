import { useState, useEffect } from 'react'
import GoalsTab from './components/GoalsTab'
import TasksTab from './components/TasksTab'
import InspirationsTab from './components/InspirationsTab'
import FocusMode from './components/FocusMode'

const TABS = [
  { id: 'goals',        label: '长期任务' },
  { id: 'today',        label: '今日清单' },
  { id: 'inspirations', label: '灵感涌现' },
]

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback }
  catch { return fallback }
}

const EMPTY_BUBBLES = { purple: [], blue: [], green: [], yellow: [] }

export default function App() {
  const [activeTab, setActiveTab]       = useState('today')
  const [goals, setGoals]               = useState(() => loadJSON('momentum_goals', ['','','']))
  const [startDate, setStartDate]       = useState(() => localStorage.getItem('momentum_start') ?? '')
  const [endDate, setEndDate]           = useState(() => localStorage.getItem('momentum_end') ?? '')
  const [bubbles, setBubbles]           = useState(() => loadJSON(`momentum_tasks_${todayKey()}`, EMPTY_BUBBLES))
  const [inspirations, setInspirations] = useState(() => loadJSON('momentum_inspirations', []))
  const [focusItem, setFocusItem]       = useState(null)

  useEffect(() => { localStorage.setItem('momentum_goals', JSON.stringify(goals)) }, [goals])
  useEffect(() => { localStorage.setItem('momentum_start', startDate) }, [startDate])
  useEffect(() => { localStorage.setItem('momentum_end', endDate) }, [endDate])
  useEffect(() => { localStorage.setItem(`momentum_tasks_${todayKey()}`, JSON.stringify(bubbles)) }, [bubbles])
  useEffect(() => { localStorage.setItem('momentum_inspirations', JSON.stringify(inspirations)) }, [inspirations])

  const calendarData = (() => {
    const result = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith('momentum_tasks_')) continue
      const date = key.replace('momentum_tasks_', '')
      try {
        const data = JSON.parse(localStorage.getItem(key))
        const counts = {}
        Object.entries(data).forEach(([q, arr]) => { counts[q] = arr.filter(b => b.completed).length })
        result[date] = counts
      } catch {}
    }
    return result
  })()

  function handleStartChange(val) {
    localStorage.clear()
    setGoals(['','','']); setStartDate(val); setEndDate('')
    setBubbles(EMPTY_BUBBLES); setInspirations([])
    localStorage.setItem('momentum_start', val)
  }

  function handleAddToBubbles(quadrant, bubble) {
    setBubbles(prev => ({ ...prev, [quadrant]: [...(prev[quadrant] || []), bubble].slice(0, 9) }))
    setActiveTab('today')
  }

  return (
    <div className="flex flex-col h-screen bg-[#fafafa] overflow-hidden">
      {focusItem && <FocusMode item={focusItem} onExit={() => setFocusItem(null)} />}

      <main className="flex-1 overflow-hidden">
        <div className="h-full w-full">
          {activeTab === 'goals' && (
            <div className="h-full overflow-y-auto">
              <GoalsTab goals={goals} startDate={startDate} endDate={endDate}
                calendarData={calendarData} onGoalsChange={setGoals}
                onStartChange={handleStartChange} onEndChange={setEndDate}
                onDayClick={() => setActiveTab('today')} />
            </div>
          )}
          {activeTab === 'today' && (
            <TasksTab bubbles={bubbles} onBubblesChange={setBubbles} onFocus={setFocusItem} />
          )}
          {activeTab === 'inspirations' && (
            <InspirationsTab inspirations={inspirations} onInspirationsChange={setInspirations}
              onFocus={setFocusItem} onAddToBubbles={handleAddToBubbles} />
          )}
        </div>
      </main>

      <nav className="shrink-0 border-t border-gray-100 bg-white flex justify-around items-center px-6 py-3 md:justify-center md:gap-20">
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="active:scale-95 transition-transform duration-100 flex flex-col items-center gap-1.5 px-2"
          >
            <span className={`text-xs tracking-wide transition-colors ${activeTab === id ? 'text-gray-800 font-medium' : 'text-gray-300'}`}>
              {label}
            </span>
            <span className={`h-0.5 w-4 rounded-full transition-all ${activeTab === id ? 'bg-gray-800' : 'bg-transparent'}`} />
          </button>
        ))}
      </nav>
    </div>
  )
}
