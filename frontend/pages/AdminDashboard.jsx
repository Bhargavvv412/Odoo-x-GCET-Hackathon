import React from 'react'
import Card from '../components/Card.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function AdminDashboard() {
  const { user } = useAuth()
  return (
    <div>
      <h2>Admin Dashboard - {user?.name}</h2>
      <div className="grid">
        <Card title="Team Attendance">
          <p>2/5 present today</p>
        </Card>
        <Card title="Pending Leaves">
          <p>1 pending</p>
        </Card>
        <Card title="Payroll Overview">
          <p>All processed</p>
        </Card>
      </div>
    </div>
  )
}
