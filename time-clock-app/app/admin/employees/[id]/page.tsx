'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

// Owner: C
// TODO: Per-employee shifts, close open shift, edit shift with reason + change history.
export default function AdminEmployeeDetailPage() {
  const params = useParams()
  const [time, setTime] = useState<Date | null>(null)
  const [isGreen, setIsGreen] = useState(false)

  useEffect(() => {
    setTime(new Date())
    const interval = setInterval(() => setTime(new Date()), 10000) //update ever 10 sec
    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours} : ${minutes}`
  }

  const formatDate = (date: Date) => {
    const weekday = date.toLocaleString('en-US', { weekday: 'short' })
    const day = date.getDate()
    const month = date.toLocaleString('en-US', { month: 'short' })
    const year = date.getFullYear()
    return `${weekday}, ${day}. ${month}. ${year}`
  }

  return (
    <main className="p-[5%]">
      <header className="flex justify-between items-center bg-zinc-100 dark:bg-zinc-900 py-4 px-[11%] rounded-lg mb-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-black tracking-tighter text-blue-600 dark:text-blue-400">
            AcmeCorp Logo
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {params?.id ? `ID: ${params.id} - ` : ''}John Doe
          </span>
          <button className="text-sm text-red-500 hover:text-red-700 transition-colors">
            Log out
          </button>
        </div>
      </header>

      <div
        className={`flex flex-row items-center justify-between my-12 p-8 rounded-2xl transition-colors duration-300 ${isGreen ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-zinc-800'}`}
      >
        <div className="flex-1 flex justify-start">
          <button
            onClick={() => setIsGreen(!isGreen)}
            className={`w-40 py-4 font-bold rounded-xl shadow transition-colors text-lg flex items-center justify-center ${
              !isGreen
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200'
            }`}
          >
            {!isGreen ? 'Check In' : 'Check Out'}
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-[40px] font-medium text-zinc-800 dark:text-zinc-100 tabular-nums leading-tight">
            {time ? (
              <>
                <div>{formatTime(time)}</div>
                <div>{formatDate(time)}</div>
              </>
            ) : (
              '\u00A0'
            )}
          </div>
        </div>

        <div className="flex-1 flex justify-end">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://example.com/admin/employees/10`}
            alt="QR Code"
            className="w-[120px] h-[120px] rounded bg-white p-2 shadow-sm"
          />
        </div>
      </div>

      <h1 className="text-xl font-semibold">AdminEmployeeDetailPage</h1>
    </main>
  )
}
