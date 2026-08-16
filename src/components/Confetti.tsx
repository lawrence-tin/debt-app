import { useEffect, useState } from 'react'

interface Piece {
  id: number
  left: number
  color: string
  delay: number
  duration: number
  rotate: number
}

const COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#f43f5e', '#a78bfa']

export default function Confetti({ trigger }: { trigger: number }) {
  const [pieces, setPieces] = useState<Piece[]>([])

  useEffect(() => {
    if (trigger === 0) return
    const next = Array.from({ length: 70 }, (_, i) => ({
      id: i + Math.random(),
      left: Math.random() * 100,
      color: COLORS[i % COLORS.length],
      delay: Math.random() * 0.4,
      duration: 2.4 + Math.random() * 1.6,
      rotate: Math.random() * 360,
    }))
    setPieces(next)
    const t = setTimeout(() => setPieces([]), 4200)
    return () => clearTimeout(t)
  }, [trigger])

  return (
    <>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: 7,
            height: 12,
            background: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotate}deg)`,
            borderRadius: 2,
          }}
        />
      ))}
    </>
  )
}
