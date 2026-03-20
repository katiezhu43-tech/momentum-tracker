import { useState, useRef } from 'react'
import { Mic, MicOff, Send, Dice3 } from 'lucide-react'

const QUADRANTS = [
  { key: 'purple', label: '重要且紧急' },
  { key: 'blue',   label: '重要不紧急' },
  { key: 'green',  label: '不重要但紧急' },
  { key: 'yellow', label: '不重要不紧急' },
]

// 100张照片列表
const PHOTOS = Array.from({ length: 100 }, (_, i) => {
  const n = [1,2,3,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,
    21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,
    41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,
    61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,
    81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100][i]
  return `/photos/${String(n).padStart(2,'0')}.jpg`
}).filter(Boolean)

// 初始装饰气泡（无文字，纯照片）
const DECO_BUBBLES = Array.from({ length: 12 }, (_, i) => ({
  id: `deco-${i}`,
  photo: PHOTOS[i % PHOTOS.length],
  size: 50 + (i * 13) % 50,
  left: (i * 19 + 5) % 80,
  top:  (i * 27 + 5) % 65,
  dur:  3 + (i * 0.4) % 2.5,
  delay: (i * 0.25) % 2,
}))

function mockAIScore(text) {
  const high = ['学习','创业','产品','优化','重要','核心','突破','创新','目标','计划']
  const low  = ['刷','玩','闲','随便','无聊','休息']
  let score = 5 + Math.random() * 2
  if (high.some(k => text.includes(k))) score = 7.5 + Math.random() * 2.5
  if (low.some(k => text.includes(k)))  score = 2 + Math.random() * 3
  return Math.min(10, Math.round(score * 10) / 10)
}

// 装饰气泡（无文字）
function DecoBubble({ b }) {
  return (
    <div style={{
      position: 'absolute',
      left: `${b.left}%`,
      top: `${b.top}%`,
      width: b.size,
      height: b.size,
      animation: `float ${b.dur}s ease-in-out ${b.delay}s infinite`,
      pointerEvents: 'none',
    }}
      className="rounded-full overflow-hidden opacity-40"
    >
      <img src={b.photo} alt="" className="w-full h-full object-cover object-top" />
    </div>
  )
}

// 灵感气泡（有照片+文字）
function InspirationBubble({ item, index, onClick, onLongPress }) {
  const size = Math.round(70 + (item.score / 10) * 50)
  const left = (index * 17 + 10) % 72
  const top  = (index * 23 + 10) % 58
  const photo = PHOTOS[index % PHOTOS.length]
  const longTimer = useRef(null)

  function handlePointerDown() {
    longTimer.current = setTimeout(() => { longTimer.current = null; onLongPress(item) }, 500)
  }
  function handlePointerUp() {
    if (longTimer.current) { clearTimeout(longTimer.current); longTimer.current = null }
  }

  return (
    <button
      onClick={() => onClick(item)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{
        position: 'absolute',
        left: `${left}%`,
        top: `${top}%`,
        width: size,
        height: size,
        animation: `float ${3 + index * 0.5}s ease-in-out ${index * 0.3}s infinite`,
      }}
      className="rounded-full overflow-hidden active:scale-95 transition-transform duration-100 select-none shadow-sm"
    >
      {/* 照片背景 */}
      <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
      {/* 半透明遮罩 + 文字 */}
      <div className="absolute inset-0 rounded-full flex flex-col items-center justify-end pb-2"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 50%, transparent 100%)' }}>
        <span className="text-[9px] text-white leading-tight px-2 text-center line-clamp-2">{item.text}</span>
        <span className="text-[8px] text-white/70 mt-0.5">{item.score}</span>
      </div>
    </button>
  )
}

function QuadrantModal({ onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/10" onClick={onClose}>
      <div className="bg-[#FFFDF7] rounded-t-2xl w-full max-w-sm p-5 pb-10 border-t border-[#E8E0D0]" onClick={e => e.stopPropagation()}>
        <p className="text-xs text-[#B5A898] text-center mb-4 tracking-widest uppercase">添加到</p>
        <div className="flex flex-col gap-2">
          {QUADRANTS.map(q => (
            <button key={q.key} onClick={() => onSelect(q.key)}
              className="active:scale-95 transition-transform duration-100 py-3 rounded-xl text-sm text-[#4A4035] hover:bg-[#F5F0E8] transition-colors">
              {q.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function InspirationsTab({ inspirations, onInspirationsChange, onFocus, onAddToBubbles }) {
  const [modal, setModal] = useState(null)
  const [inputText, setInputText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [scoring, setScoring] = useState(false)
  const recognitionRef = useRef(null)

  async function submitInspiration(text) {
    const t = text.trim()
    if (!t) return
    setScoring(true)
    await new Promise(r => setTimeout(r, 600))
    const score = mockAIScore(t)
    setScoring(false)
    const newItem = { text: t, score, id: Date.now() + Math.random() }
    onInspirationsChange(prev => [...prev, newItem].slice(-20))
    setInputText('')
  }

  function handleSend() { submitInspiration(inputText) }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  function toggleVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('当前浏览器不支持语音输入，请使用 Chrome'); return }
    if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); return }
    const rec = new SR()
    rec.lang = 'zh-CN'; rec.interimResults = false
    rec.onresult = e => setInputText(prev => prev + e.results[0][0].transcript)
    rec.onend = () => setIsRecording(false)
    rec.onerror = () => setIsRecording(false)
    recognitionRef.current = rec
    rec.start(); setIsRecording(true)
  }

  function handleDice() {
    if (!inspirations.length) { alert('暂无灵感，请先记录一些想法！'); return }
    onFocus(inspirations[Math.floor(Math.random() * inspirations.length)])
  }

  function handleQuadrantSelect(quadrant) {
    if (!modal) return
    onAddToBubbles(quadrant, { text: modal.text, completed: false })
    setModal(null)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative overflow-hidden">
        {/* 初始装饰气泡（始终显示） */}
        {DECO_BUBBLES.map(b => <DecoBubble key={b.id} b={b} />)}

        {/* 灵感气泡 */}
        {inspirations.map((item, i) => (
          <InspirationBubble key={item.id ?? i} item={item} index={i}
            onClick={item => setModal(item)}
            onLongPress={onFocus} />
        ))}
      </div>

      {/* 输入栏 */}
      <div className="shrink-0 px-4 pb-6 pt-3 flex gap-2 items-end">
        <div className="flex-1 flex items-center gap-2 bg-[#FFFDF7] border border-[#E8E0D0] rounded-2xl px-4 py-2.5 min-h-[48px]">
          <textarea rows={1}
            className="flex-1 bg-transparent text-sm text-[#4A4035] outline-none resize-none placeholder-[#C8BDB0] leading-relaxed"
            placeholder="记录灵感..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ maxHeight: 80 }}
          />
          <button onClick={toggleVoice}
            className={`shrink-0 active:scale-95 transition-all duration-100 ${isRecording ? 'text-red-400' : 'text-[#B5A898] hover:text-[#8C7B6B]'}`}>
            {isRecording ? <MicOff size={16} strokeWidth={1.5} /> : <Mic size={16} strokeWidth={1.5} />}
          </button>
        </div>
        <button onClick={handleSend} disabled={!inputText.trim() || scoring}
          className="shrink-0 w-12 h-12 rounded-full border border-[#E8E0D0] bg-[#FFFDF7] flex items-center justify-center text-[#B5A898] hover:border-[#C8BDB0] transition-colors active:scale-95 duration-100 disabled:opacity-30">
          {scoring ? <span className="text-[10px] text-[#B5A898]">…</span> : <Send size={15} strokeWidth={1.5} />}
        </button>
        <button onClick={handleDice}
          className="shrink-0 w-12 h-12 rounded-full border border-[#E8E0D0] bg-[#FFFDF7] flex items-center justify-center text-[#B5A898] hover:border-[#C8BDB0] transition-colors active:scale-95 duration-100">
          <Dice3 size={18} strokeWidth={1.5} />
        </button>
      </div>

      {modal && <QuadrantModal onSelect={handleQuadrantSelect} onClose={() => setModal(null)} />}
    </div>
  )
}
