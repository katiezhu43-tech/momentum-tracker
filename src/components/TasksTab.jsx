import { useState, useRef } from 'react'
import { Plus } from 'lucide-react'

const QUADRANTS = [
  { key: 'purple', label: '重要且紧急',   color: '#C084FC' },
  { key: 'blue',   label: '重要不紧急',   color: '#93C5FD' },
  { key: 'green',  label: '不重要但紧急', color: '#86EFAC' },
  { key: 'yellow', label: '不重要不紧急', color: '#FDE68A' },
]

const WEEK = ['日','一','二','三','四','五','六']
function todayLabel() {
  const d = new Date()
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 星期${WEEK[d.getDay()]}`
}

// 单个气泡槽位
function BubbleSlot({ bubble, color, onToggle, onDelete, onFocus, onAddEmpty }) {
  const clickTimer = useRef(null)
  const clickCount = useRef(0)
  const longTimer  = useRef(null)

  function handlePointerDown() {
    if (!bubble) return
    longTimer.current = setTimeout(() => {
      longTimer.current = null
      onFocus()
    }, 500)
  }
  function handlePointerUp() {
    if (longTimer.current) { clearTimeout(longTimer.current); longTimer.current = null }
  }
  function handleClick() {
    if (!bubble) { onAddEmpty(); return }
    if (longTimer.current === undefined) return // long press fired
    clickCount.current += 1
    if (clickCount.current === 1) {
      clickTimer.current = setTimeout(() => { clickCount.current = 0; onToggle() }, 280)
    } else {
      clearTimeout(clickTimer.current); clickCount.current = 0; onDelete()
    }
  }

  if (!bubble) {
    return (
      <button onClick={handleClick}
        className="aspect-square rounded-full border border-dashed flex items-center justify-center text-[#C8BDB0] hover:border-gray-300 hover:text-[#B5A898] transition-colors active:scale-95 duration-100"
        style={{ borderColor: '#e5e7eb' }}>
        <Plus size={12} strokeWidth={1.5} />
      </button>
    )
  }

  return (
    <button onClick={handleClick} onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}
      style={{ backgroundColor: color }}
      className={`aspect-square rounded-full flex items-center justify-center text-white text-[9px] leading-tight px-1 text-center transition-all duration-200 select-none
        ${bubble.completed ? 'opacity-100 scale-105 shadow-sm' : 'opacity-30'}`}>
      <span className="line-clamp-2 break-all">{bubble.text}</span>
    </button>
  )
}

// 单个象限
function Quadrant({ q, bubbles, onToggle, onDelete, onFocus, onAdd }) {
  const slots = Array.from({ length: 9 }, (_, i) => bubbles[i] ?? null)
  return (
    <div className="border border-[#E8E0D0] rounded-2xl p-3 md:p-4 flex flex-col gap-2 h-full bg-[#FFFDF7]">
      <span className="text-[10px] tracking-wide" style={{ color: q.color }}>{q.label}</span>
      <div className="grid grid-cols-3 gap-2 md:gap-3 flex-1">
        {slots.map((bubble, i) => (
          <BubbleSlot key={i} bubble={bubble} color={q.color}
            onToggle={() => onToggle(q.key, i)}
            onDelete={() => onDelete(q.key, i)}
            onFocus={() => onFocus({ ...bubble, color: q.key })}
            onAddEmpty={() => onAdd(q.key, i)} />
        ))}
      </div>
    </div>
  )
}

// 根据重要/紧急标签推导象限 key
function getQuadrantKey(important, urgent) {
  if (important && urgent)  return 'purple'
  if (important && !urgent) return 'blue'
  if (!important && urgent) return 'green'
  return 'yellow'
}

// 从 bubbles 展开成 task list
function flattenBubbles(bubbles) {
  const tasks = []
  QUADRANTS.forEach(q => {
    ;(bubbles[q.key] || []).forEach(b => {
      tasks.push({
        id: Math.random(),
        text: b.text,
        completed: b.completed,
        important: q.key === 'purple' || q.key === 'blue',
        urgent:    q.key === 'purple' || q.key === 'green',
      })
    })
  })
  return tasks
}

// 文字输入二级页面 — list 模式
function InputPage({ bubbles, onBubblesChange, onClose }) {
  const [tasks, setTasks] = useState(() => flattenBubbles(bubbles))
  const [newText, setNewText] = useState('')

  function addTask() {
    const t = newText.trim()
    if (!t) return
    setTasks(prev => [...prev, { id: Math.random(), text: t, completed: false, important: false, urgent: false }])
    setNewText('')
  }

  function toggleTag(id, tag) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [tag]: !t[tag] } : t))
  }

  function updateText(id, val) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, text: val } : t))
  }

  function removeTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  function handleConfirm() {
    const next = { purple: [], blue: [], green: [], yellow: [] }
    tasks.forEach(t => {
      const key = getQuadrantKey(t.important, t.urgent)
      if (next[key].length < 9) next[key].push({ text: t.text, completed: t.completed })
    })
    onBubblesChange(next)
    onClose()
  }

  return (
    <div className="absolute inset-0 bg-[#F5F0E8] z-10 flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 bg-[#FFFDF7] border-b border-[#E8E0D0]">
        <button onClick={onClose} className="text-sm text-[#8C7B6B] active:scale-95 transition-transform duration-100">取消</button>
        <span className="text-sm text-[#4A4035]">编辑任务</span>
        <button onClick={handleConfirm} className="text-sm text-[#1A1A1A] font-medium active:scale-95 transition-transform duration-100">确认</button>
      </div>

      {/* 图例 */}
      <div className="flex gap-3 px-5 py-2 border-b border-gray-50">
        {[
          { label: '重要', color: '#C084FC' },
          { label: '紧急', color: '#93C5FD' },
        ].map(t => (
          <span key={t.label} className="flex items-center gap-1 text-[10px] text-[#B5A898]">
            <span className="w-2 h-2 rounded-sm inline-block" style={{ background: t.color }} />
            {t.label}
          </span>
        ))}
        <span className="text-[10px] text-[#C8BDB0] ml-auto">点击标签自动分配象限</span>
      </div>

      {/* 任务列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center gap-3 bg-[#FFFDF7] border border-[#E8E0D0] rounded-xl px-3 py-2.5">
            {/* 重要 / 紧急 标签 */}
            <button onClick={() => toggleTag(task.id, 'important')}
              className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border transition-all duration-150 active:scale-95
                ${task.important ? 'border-purple-200 bg-purple-50 text-purple-400' : 'border-[#E8E0D0] text-[#B5A898]'}`}>
              重要
            </button>
            <button onClick={() => toggleTag(task.id, 'urgent')}
              className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border transition-all duration-150 active:scale-95
                ${task.urgent ? 'border-blue-200 bg-blue-50 text-blue-400' : 'border-[#E8E0D0] text-[#B5A898]'}`}>
              紧急
            </button>
            {/* 象限指示点 */}
            <span className="shrink-0 w-2 h-2 rounded-full"
              style={{ background: QUADRANTS.find(q => q.key === getQuadrantKey(task.important, task.urgent))?.color }} />
            {/* 文字 */}
            <input className="flex-1 text-sm text-[#4A4035] bg-transparent outline-none placeholder-gray-200"
              value={task.text} onChange={e => updateText(task.id, e.target.value)} />
            {/* 删除 */}
            <button onClick={() => removeTask(task.id)} className="shrink-0 text-[#C8BDB0] hover:text-[#8C7B6B] text-lg leading-none active:scale-95">×</button>
          </div>
        ))}

        {/* 新增输入行 */}
        <div className="flex items-center gap-2 bg-[#FFFDF7] border border-dashed border-[#E8E0D0] rounded-xl px-3 py-2.5">
          <input className="flex-1 text-sm text-[#4A4035] bg-transparent outline-none placeholder-gray-200"
            placeholder="添加任务，按 Enter 确认..."
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()} />
          <button onClick={addTask} className="shrink-0 text-[#B5A898] hover:text-gray-500 active:scale-95">
            <Plus size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TasksTab({ bubbles, onBubblesChange, onFocus }) {
  const [showInput, setShowInput] = useState(false)

  function handleToggle(quadrant, idx) {
    const next = { ...bubbles }
    next[quadrant] = [...next[quadrant]]
    next[quadrant][idx] = { ...next[quadrant][idx], completed: !next[quadrant][idx].completed }
    onBubblesChange(next)
  }

  function handleDelete(quadrant, idx) {
    const next = { ...bubbles }
    next[quadrant] = next[quadrant].filter((_, i) => i !== idx)
    onBubblesChange(next)
  }

  function handleAdd(_quadrant, _slotIdx) {
    setShowInput(true)
  }

  return (
    <div className="relative flex flex-col h-full">
      {showInput && (
        <InputPage bubbles={bubbles} onBubblesChange={onBubblesChange} onClose={() => setShowInput(false)} />
      )}
      <div className="flex items-center justify-between px-5 md:px-6 py-4">
        <span className="text-xs text-[#B5A898]">{todayLabel()}</span>
        <button onClick={() => setShowInput(true)}
          className="active:scale-95 transition-transform duration-100 flex items-center gap-1 text-xs text-[#8C7B6B] hover:text-[#4A4035] transition-colors">
          <Plus size={13} strokeWidth={1.5} /> 编辑任务
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-4 grid grid-cols-2 gap-3 md:gap-4" style={{gridAutoRows: '1fr'}}>
        {QUADRANTS.map(q => (
          <Quadrant key={q.key} q={q} bubbles={bubbles[q.key] || []}
            onToggle={handleToggle} onDelete={handleDelete}
            onFocus={onFocus} onAdd={handleAdd} />
        ))}
      </div>
    </div>
  )
}
