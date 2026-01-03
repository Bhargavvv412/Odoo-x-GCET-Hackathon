import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { fetchPayroll, fetchAllPayroll, updatePayroll } from '../services/mockApi'

export default function Payroll() {
  const { user } = useAuth()
  const [payrolls, setPayrolls] = useState([])

  // Fetch data based on role
  useEffect(() => {
    if (!user) return

    if (user.role === 'admin') {
      fetchAllPayroll().then(setPayrolls)
    } else {
      fetchPayroll(user.id).then(setPayrolls)
    }
  }, [user])

  // Admin-only change handler
  function handleChange(id, field, value) {
    setPayrolls((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, [field]: Number(value) } : p
      )
    )
  }

  // Admin-only save
  async function savePayroll(p) {
    const base = p.base ?? p.salary ?? 0
    const allowances = p.allowances ?? 0
    const deductions = p.deductions ?? 0
    const net = base + allowances - deductions

    await updatePayroll({ ...p, net })
    alert('Payroll updated successfully')
  }

  if (!user) return null

  return (
    <div>
      <h2>Payroll</h2>

      <p className="small info">
        {user.role === 'admin'
          ? 'Admin can view and update payroll for all employees.'
          : 'Payroll details are view-only.'}
      </p>

      <div className="grid">
        {payrolls.map((p) => {
          const base = p.base ?? p.salary ?? 0
          const allowances = p.allowances ?? 0
          const deductions = p.deductions ?? 0
          const net = p.net ?? (base + allowances - deductions)

          return (
            <div className="card" key={p._id || p.id}>
              {user.role === 'admin' && (
                <>
                  <p><strong>{p.employeeName}</strong></p>
                  <p className="small">{p.month}</p>

                  <label>Base Salary</label>
                  <input
                    type="number"
                    value={base}
                    onChange={(e) =>
                      handleChange(p.id, 'base', e.target.value)
                    }
                  />

                  <label>Allowances</label>
                  <input
                    type="number"
                    value={allowances}
                    onChange={(e) =>
                      handleChange(p.id, 'allowances', e.target.value)
                    }
                  />

                  <label>Deductions</label>
                  <input
                    type="number"
                    value={deductions}
                    onChange={(e) =>
                      handleChange(p.id, 'deductions', e.target.value)
                    }
                  />

                  <p><strong>Net Pay: ₹{net}</strong></p>

                  <button onClick={() => savePayroll(p)}>
                    Save
                  </button>
                </>
              )}

              {user.role !== 'admin' && (
                <>
                  <p><strong>{p.month}</strong></p>
                  <p>Base Salary: ₹{base}</p>
                  <p>Allowances: ₹{allowances}</p>
                  <p>Deductions: ₹{deductions}</p>
                  <p><strong>Net Pay: ₹{net}</strong></p>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
