import { useState, useEffect } from 'react'

const PHOTOS = Array.from({ length: 100 }, (_, i) => {
  const nums = [1,2,3,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,
    21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,
    41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,
    61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,
    81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100]
  return `/photos/${String(nums[i]).padStart(2,'0')}.jpg`
})

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

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

// 蓄水圆圈组件
function WaterBubble({ elapsed, photo }) {
  // 每60秒涨满，最多100%
  const fillPct = Math.min(100, (elapsed % 60) / 60 * 100)
  const size = 200

  return (
    <div style={{ width: size, height: size, position: 'relative' }} className="rounded-full overflow-hidden shadow-lg">
      {/* 照片层 */}
      <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover object-top" />

      {/* 水波遮罩：从下往上涨 */}
      <div
        className="absolute left-0 right-0 bottom-0 transition-all duration-1000 ease-linear"
        style={{
          height: `${fillPct}%`,
          background: 'rgba(147, 197, 253, 0.45)',
          backdropFilter: 'blur(1px)',
        }}
      >
        {/* 波浪顶部 */}
        <svg viewBox="0 0 200 20" className="absolute -top-4 left-0 w-full" style={{ height: 20 }}>
          <path
            d="M0,10 C30,0 70,20 100,10 C130,0 170,20 200,10 L200,20 L0,20 Z"
            fill="rgba(147, 197, 253, 0.45)"
          />
        </svg>
      </div>

      {/* 深色渐变底部文字区 */}
      <div className="absolute inset-0 rounded-full"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.3) 30%, transparent 70%)' }} />
    </div>
  )
}

export default function FocusMode({ item, onExit }) {
  const [elapsed, setElapsed] = useState(0)
  const [hint] = useState(() => genActionHint(item.text))
  const [photo] = useState(() => PHOTOS[Math.floor(Math.random() * PHOTOS.length)])

  useEffect(() => {
    const id = setInterval(() => setElapsed(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FFFDF7] gap-5">
      <p className="text-[11px] text-[#C8BDB0] tracking-widest uppercase">专注中</p>

      {/* 蓄水气泡 */}
      <WaterBubble elapsed={elapsed} photo={photo} />

      {/* 任务名 */}
      <p className="text-base text-[#4A4035] font-medium px-8 text-center">{item.text}</p>

      {/* 计时器 */}
      <div className="text-4xl font-light text-[#1A1A1A] tabular-nums tracking-tight">
        {formatTime(elapsed)}
      </div>

      {/* 执行提示 */}
      <div className="max-w-xs text-center px-6">
        <p className="text-[11px] text-[#B5A898] tracking-widest uppercase mb-1">立刻行动</p>
        <p className="text-xs text-[#8C7B6B] leading-relaxed">{hint}</p>
      </div>

      <button onClick={onExit}
        className="mt-2 active:scale-95 transition-transform duration-100 text-sm text-[#B5A898] border border-[#E8E0D0] rounded-full px-8 py-2.5 hover:border-[#C8BDB0] hover:text-[#8C7B6B] transition-colors">
        退出专注
      </button>
    </div>
  )
}
