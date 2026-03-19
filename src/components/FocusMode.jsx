import { useState, useEffect } from 'react'

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

// 根据任务文本生成1-2句执行向提示
function genActionHint(text) {
  const hints = [
    `打开电脑，新建一个文档，写下"${text}"作为标题，然后列出3个子步骤。`,
    `先关掉手机通知，打开一个空白页面，把"${text}"拆成最小的第一步开始做。`,
    `倒一杯水，坐好，打开相关工具，直接开始"${text}"的第一个动作。`,
    `设置25分钟计时，专注只做"${text}"，其他事情先放一边。`,
    `打开备忘录，写下完成"${text}"后你会有什么感受，然后立刻开始。`,
    `找到上次进度，从断点继续，不要重新开始，直接推进"${text}"。`,
  ]
  return hints[Math.floor(Math.random() * hints.length)]
}

export default function FocusMode({ item, onExit }) {
  const [elapsed, setElapsed] = useState(0)
  const [hint] = useState(() => genActionHint(item.text))

  // bubble color from item
  const colorMap = {
    purple: '#C084FC', blue: '#93C5FD', green: '#86EFAC', yellow: '#FDE68A'
  }
  const bubbleColor = colorMap[item.color] || '#C084FC'

  useEffect(() => {
    const id = setInterval(() => setElapsed(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white gap-6">
      <p className="text-[11px] text-gray-200 tracking-widest uppercase">专注中</p>

      {/* 圆形气泡 */}
      <div className="w-36 h-36 rounded-full flex items-center justify-center text-center px-4 shadow-sm"
        style={{ backgroundColor: bubbleColor }}>
        <span className="text-sm text-white font-medium leading-snug">{item.text}</span>
      </div>

      {/* 计时器 */}
      <div className="text-5xl font-light text-gray-800 tabular-nums tracking-tight">
        {formatTime(elapsed)}
      </div>

      {/* 执行提示 */}
      <div className="max-w-xs text-center px-6">
        <p className="text-[11px] text-gray-300 tracking-widest uppercase mb-2">立刻行动</p>
        <p className="text-sm text-gray-400 leading-relaxed">{hint}</p>
      </div>

      <button onClick={onExit}
        className="mt-4 active:scale-95 transition-transform duration-100 text-sm text-gray-300 border border-gray-100 rounded-full px-8 py-2.5 hover:border-gray-200 hover:text-gray-400 transition-colors">
        退出专注
      </button>
    </div>
  )
}
