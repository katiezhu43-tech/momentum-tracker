import { useState, useRef } from 'react'
import { Mic, MicOff, Send, Dice3 } from 'lucide-react'

const QUADRANTS = [
  { key: 'purple', label: '重要且紧急' },
  { key: 'blue',   label: '重要不紧急' },
  { key: 'green',  label: '不重要但紧急' },
  { key: 'yellow', label: '不重要不紧急' },
]

// Mock AI 打分：根据关键词给出 1-10 分
function mockAIScore(text) {
  const high = ['学习','创业','产品','优化','重要','核心','突破','创新','目标','计划']
  const low  = ['刷','玩','闲','随便','无聊','休息']
  let score = 5 + Math.random() * 2
  if (high.some(k => text.includes(k))) score = 7.5 + Math.random() * 2.5
  if (low.some(k => text.includes(k)))  score = 2 + Math.random() * 3
  return Math.min(10, Math.round(score * 10) / 10)
}

function InspirationBubble({ item, index, onClick, onLongPress }) {
  const size = Math.round(60 + (item.score / 10) * 60)
  const isHigh = item.score > 7
  const left = (index * 17 + 10) % 75
  const top  = (index * 23 + 10) % 60
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
        background: isHigh ? 'linear-gradient(135deg, #e9d5ff, #fbcfe8)' : '#f3f4f6',
      }}
      className="rounded-full flex flex-col items-center justify-center text-center active:scale-95 transition-transform duration-100 select-none"
    >
      <span className={`text-[10px] leading-tight px-2 ${isHigh ? 'text-purple-400' : 'text-[#B5A898]'}`}>
        {item.text}
      </span>
      {isHigh && <span className="text-[9px] text-purple-300 mt-0.5">{item.score}</span>}
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
              className="active:scale-95 transition-transform duration-100 py-3 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors">
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

  // 提交灵感（文字或语音识别结果）
  async function submitInspiration(text) {
    const t = text.trim()
    if (!t) return
    setScoring(true)
    // 模拟 AI 打分延迟
    await new Promise(r => setTimeout(r, 600))
    const score = mockAIScore(t)
    setScoring(false)
    const newItem = { text: t, score, id: Date.now() + Math.random() }
    onInspirationsChange(prev => [...prev, newItem].slice(-20))
    setInputText('')
  }

  function handleSend() {
    submitInspiration(inputText)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // 语音输入（Web Speech API，不支持时降级提示）
  function toggleVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) { alert('当前浏览器不支持语音输入，请使用 Chrome'); return }

    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
      return
    }

    const rec = new SpeechRecognition()
    rec.lang = 'zh-CN'
    rec.interimResults = false
    rec.onresult = e => {
      const transcript = e.results[0][0].transcript
      setInputText(prev => prev + transcript)
    }
    rec.onend = () => setIsRecording(false)
    rec.onerror = () => setIsRecording(false)
    recognitionRef.current = rec
    rec.start()
    setIsRecording(true)
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
        {inspirations.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-[#C8BDB0] text-sm">
            输入或说出你的灵感
          </div>
        )}
        {inspirations.map((item, i) => (
          <InspirationBubble key={item.id ?? i} item={item} index={i}
            onClick={item => setModal(item)}
            onLongPress={onFocus} />
        ))}
      </div>

      {/* 输入栏 */}
      <div className="shrink-0 px-4 pb-6 pt-3 flex gap-2 items-end">
        <div className="flex-1 flex items-center gap-2 bg-[#FFFDF7] border border-[#E8E0D0] rounded-2xl px-4 py-2.5 min-h-[48px]">
          <textarea
            rows={1}
            className="flex-1 bg-transparent text-sm text-[#4A4035] outline-none resize-none placeholder-gray-200 leading-relaxed"
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
          className="shrink-0 w-12 h-12 rounded-full border border-[#E8E0D0] bg-[#FFFDF7] flex items-center justify-center text-[#B5A898] hover:border-gray-200 hover:text-[#8C7B6B] transition-colors active:scale-95 duration-100 disabled:opacity-30">
          {scoring ? <span className="text-[10px] text-[#B5A898]">…</span> : <Send size={15} strokeWidth={1.5} />}
        </button>
        <button onClick={handleDice}
          className="shrink-0 w-12 h-12 rounded-full border border-[#E8E0D0] bg-[#FFFDF7] flex items-center justify-center text-[#B5A898] hover:border-gray-200 transition-colors active:scale-95 duration-100">
          <Dice3 size={18} strokeWidth={1.5} />
        </button>
      </div>

      {modal && <QuadrantModal onSelect={handleQuadrantSelect} onClose={() => setModal(null)} />}
    </div>
  )
}
