import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchAttendance, markAttendance, fetchWeeklyAttendance } from '../services/mockApi'

export default function Attendance() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [weekly, setWeekly] = useState([])
  const [view, setView] = useState('daily') // 'daily' or 'weekly'
  const [todayStatus, setTodayStatus] = useState(null)
  const [note, setNote] = useState('')

  useEffect(() => {
    if (user) fetchAttendance(user.id).then(setData)
  }, [user])

  useEffect(() => {
    if (user && view === 'weekly') fetchWeeklyAttendance(user.id).then(setWeekly)
  }, [user, view])

  async function doMark(status, extras = {}) {
    if (!user) return
    const date = new Date().toISOString().slice(0, 10)
    const payload = { userId: user.id, date, status, hours: status === 'Present' ? 8 : (status === 'Half-day' ? 4 : 0), note, ...extras }
    const res = await markAttendance(payload)
    setTodayStatus(res)
    // reload list
    fetchAttendance(user.id).then(setData)
    if (view === 'weekly') fetchWeeklyAttendance(user.id).then(setWeekly)
  }

  async function doCheckIn() {
    const ts = new Date().toISOString()
    await doMark(null, { checkIn: ts })
  }

  async function doCheckOut() {
    const ts = new Date().toISOString()
    await doMark(null, { checkOut: ts })
  }

  return (
    <div>
      <h2>Attendance</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button className={`button ${view === 'daily' ? '' : 'ghost'}`} onClick={() => setView('daily')}>Daily</button>
        <button className={`button ${view === 'weekly' ? '' : 'ghost'}`} onClick={() => setView('weekly')}>Weekly</button>
      </div>

      <div className="card">
        <h4>Mark Today</h4>
        <p>Note (optional)</p>
        <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
        <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="button" onClick={doCheckIn}>Check In</button>
          <button className="button" onClick={doCheckOut}>Check Out</button>
          <button className="button" onClick={() => doMark('Present')}>Mark Present</button>
          <button className="button ghost" onClick={() => doMark('Half-day')}>Half-day</button>
          <button className="button ghost" onClick={() => doMark('Absent')}>Mark Absent</button>
          <button className="button ghost" onClick={() => doMark('Leave')}>Mark Leave</button>
        </div>
        {todayStatus && (
          <div style={{ marginTop: 8 }}>
            <div>Marked: {todayStatus.status} ({todayStatus.hours}h)</div>
            {todayStatus.checkIn && <div>Check-in: {new Date(todayStatus.checkIn).toLocaleTimeString()}</div>}
            {todayStatus.checkOut && <div>Check-out: {new Date(todayStatus.checkOut).toLocaleTimeString()}</div>}
          </div>
        )}
      </div>

      {view === 'daily' && (
        <>
          <h4>Your Records</h4>
          <div className="grid">
            {data.map((d) => (
              <div className="card" key={d._id || d.id}>
                <p>{d.date ? new Date(d.date).toLocaleDateString() : d.date} - {d.status} ({d.hours}h)</p>
                {d.checkIn && <p>In: {new Date(d.checkIn).toLocaleTimeString()}</p>}
                {d.checkOut && <p>Out: {new Date(d.checkOut).toLocaleTimeString()}</p>}
                {d.note && <p>Note: {d.note}</p>}
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'weekly' && (
        <>
          <h4>This Week</h4>
          <div className="grid">
            {(() => {
              // Build a list of days for the week (Mon-Sun)
              const today = new Date()
              const day = today.getDay()
              const diff = (day + 6) % 7
              const start = new Date(today)
              start.setDate(today.getDate() - diff)
              start.setHours(0,0,0,0)
              return Array.from({ length: 7 }).map((_, i) => {
                const d = new Date(start)
                d.setDate(start.getDate() + i)
                const iso = d.toISOString().slice(0,10)
                const row = weekly.find(w => w.date && (w.date.slice ? w.date.slice(0,10) : new Date(w.date).toISOString().slice(0,10)) === iso)
                return (
                  <div className="card" key={iso}>
                    <strong>{d.toLocaleDateString()}</strong>
                    {row ? (
                      <div>
                        <div>{row.status} ({row.hours}h)</div>
                        {row.checkIn && <div>In: {new Date(row.checkIn).toLocaleTimeString()}</div>}
                        {row.checkOut && <div>Out: {new Date(row.checkOut).toLocaleTimeString()}</div>}
                      </div>
                    ) : <div className="small">No record</div>}
                  </div>
                )
              })
            })()}
          </div>
        </>
      )}
    </div>
  )
}
