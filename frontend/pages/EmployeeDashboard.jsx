import React from 'react'
import Card from '../components/Card.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function EmployeeDashboard() {
  const { user } = useAuth()
  return (
    <div>
      <h2>Welcome, {user?.name}</h2>
      <div className="grid">
        <Card title="Today">
          <p>Present</p>
        </Card>
        <Card title="Leaves">
          <p>2 approved</p>
        </Card>
        <Card title="Payroll">
          <p>Net: $3,800</p>
        </Card>
      </div>
    </div>
  )
}
