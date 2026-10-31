
import Plot from 'react-plotly.js'
import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [previousDay, setPreviousDay] = useState('30')
  const [previousWeek, setPreviousWeek] = useState('35')
  const [weeklyAverage, setWeeklyAverage] = useState('32')
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [historyError, setHistoryError] = useState('')
const [history, setHistory] = useState({
  dates: [],
  withdrawals: []
})
const [predictionHistory, setPredictionHistory] = useState([])
const [predictionHistoryError, setPredictionHistoryError] = useState('')
const [username, setUsername] = useState('')
const [password, setPassword] = useState('')
const [token, setToken] = useState(localStorage.getItem('access_token') || '')
const [loginError, setLoginError] = useState('')
const [loginLoading, setLoginLoading] = useState(false)
const [availableCash, setAvailableCash] = useState('50000')
const [optimizationResult, setOptimizationResult] = useState(null)
const [optimizationError, setOptimizationError] = useState('')
const [optimizationLoading, setOptimizationLoading] = useState(false)

useEffect(() => {
  async function loadHistory() {
    try {
      const response = await fetch('http://127.0.0.1:8000/history')

      if (!response.ok) {
        throw new Error('Could not load history')
      }

      const data = await response.json()
      setHistory(data)
    } catch {
      setHistoryError('Could not load historical ATM data.')
    }
  }

  loadHistory()
}, [])
async function loadPredictionHistory() {
  try {
    const response = await fetch('http://127.0.0.1:8000/predictions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Could not load prediction history')
    }

    const data = await response.json()
    setPredictionHistory(data)
    setPredictionHistoryError('')
  } catch (err) {
    setPredictionHistoryError(err.message)
  }
}
useEffect(() => {
  if (token) {
    loadPredictionHistory()
  } else {
    setPredictionHistory([])
  }
}, [token])
async function loginUser(event) {
  event.preventDefault()
  setLoginLoading(true)
  setLoginError('')

  try {
    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)

    const response = await fetch('http://127.0.0.1:8000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.detail || 'Login failed')
    }

    localStorage.setItem('access_token', result.access_token)
    setToken(result.access_token)
    setPassword('')
  } catch (err) {
    setLoginError(err.message || 'Could not connect to the server.')
  } finally {
    setLoginLoading(false)
  }
}
function logoutUser() {
  localStorage.removeItem('access_token')
  setToken('')
  setPrediction(null)
  setUsername('')
  setPassword('')
}
async function optimizeCash(event) {
  event.preventDefault()
  setOptimizationLoading(true)
  setOptimizationError('')
  setOptimizationResult(null)

  try {
    const response = await fetch('http://127.0.0.1:8000/optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        predicted_demand: Number(prediction),
        available_cash: Number(availableCash)
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.detail || 'Cash optimization failed')
    }

    setOptimizationResult(result)
  } catch (err) {
    setOptimizationError(err.message)
  } finally {
    setOptimizationLoading(false)
  }
}
  async function predictDemand(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setPrediction(null)

    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
},
        body: JSON.stringify({
          previous_day: Number(previousDay),
          previous_week: Number(previousWeek),
          weekly_average: Number(weeklyAverage)
        })
      })

      if (!response.ok) {
        throw new Error('Prediction failed. Please check the API.')
      }

      const result = await response.json()
      setPrediction(result.predicted_demand)
    } catch {
      setError('Could not connect to the API. Please ensure FastAPI is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
  <>
    {!token ? (
      <div className="login-container">
        <form className="login-card" onSubmit={loginUser}>
          <h1>ATM Insight</h1>
          <p>Sign in to access your ATM dashboard.</p>

          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {loginError && (
            <p className="error-message">{loginError}</p>
          )}

          <button type="submit" disabled={loginLoading}>
            {loginLoading ? 'Signing in...' : 'Login'}
          </button>
        </form>
            </div>
    ) : (
      <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">A</div>
          <div>
            <strong>ATM Insight</strong>
            <span>DEMAND ANALYTICS</span>
          </div>
        </div>

        <p className="nav-label">WORKSPACE</p>
        <div className="nav-item active">▦ <span>Dashboard</span></div>
        <div className="nav-item">↗ <span>Demand Prediction</span></div>
        <div className="nav-item">▤ <span>Model Performance</span></div>

        <div className="sidebar-bottom">
          <div className="status-dot"></div>
          <div>
            <strong>ML Model</strong>
            <span>KNN · 7 Neighbours</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">ANALYTICS / OVERVIEW</p>
            <h1>ATM Cash Demand Predictor</h1>
            <p className="subtitle">Monitor demand patterns and estimate upcoming cash requirements.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
  <div className="date-chip">● &nbsp; Model ready</div>
  <button type="button" onClick={logoutUser}>
    Logout
  </button>
</div>
        </header>

        <section className="welcome-banner">
          <div>
            <p className="banner-tag">INTELLIGENT CASH PLANNING</p>
            <h2>Make smarter cash decisions.</h2>
            <p>Use historical withdrawal patterns to estimate ATM cash demand.</p>
          </div>
          <div className="banner-art">₹</div>
        </section>

<section className="panel" style={{ marginBottom: '20px' }}>
  <p className="eyebrow">WITHDRAWAL ANALYTICS</p>
  <h2>ATM T1 Historical Demand Trend</h2>
  <p className="panel-description">
    Actual daily withdrawals from ATM T1. Missing values are excluded.
  </p>

  {historyError && <p className="error-message">{historyError}</p>}

  {!historyError && history.dates.length === 0 && (
    <p className="panel-description">Loading historical data...</p>
  )}

  {history.dates.length > 0 && (
    <Plot
      data={[
        {
          x: history.dates,
          y: history.withdrawals,
          type: 'scatter',
          mode: 'lines+markers',
          name: 'T1 Withdrawals',
          line: { color: '#35d6c2', width: 3 },
          marker: { size: 6 }
        }
      ]}
      layout={{
        autosize: true,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#e8f1ff' },
        xaxis: { title: 'Date', gridcolor: '#203b57', type: 'date' },
        yaxis: { title: 'Withdrawals (dataset units)', gridcolor: '#203b57' },
        margin: { l: 60, r: 20, t: 20, b: 65 },
        showlegend: false
      }}
      config={{ responsive: true, displayModeBar: false }}
      style={{ width: '100%', height: '350px' }}
      useResizeHandler
    />
  )}
</section>
<section className="panel" style={{ marginBottom: '20px' }}>
  <p className="eyebrow">SAVED RECORDS</p>
  <h2>Prediction History</h2>

  {predictionHistoryError && (
    <p className="error-message">{predictionHistoryError}</p>
  )}

  {predictionHistory.length === 0 ? (
    <p className="panel-description">No saved predictions yet.</p>
  ) : (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Previous Day</th>
            <th>Previous Week</th>
            <th>Weekly Average</th>
            <th>Predicted Demand</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {predictionHistory.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.previous_day}</td>
              <td>{item.previous_week}</td>
              <td>{item.weekly_average}</td>
              <td>{item.predicted_demand}</td>
              <td>{item.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</section>
        <section className="panel" style={{ marginBottom: '20px' }}>
  <p className="eyebrow">OR-TOOLS OPTIMIZATION</p>
  <h2>ATM Cash Allocation</h2>
  <p className="panel-description">
    Calculate the minimum cash required to meet predicted demand.
  </p>

  <form onSubmit={optimizeCash}>
    <label>
      Available ATM cash (dataset units)
      <input
        type="number"
        min="0"
        step="any"
        required
        value={availableCash}
        onChange={(e) => setAvailableCash(e.target.value)}
      />
    </label>

    <button
      type="submit"
      disabled={optimizationLoading || prediction === null}
    >
      {optimizationLoading ? 'Optimizing...' : 'Optimize Cash'}
    </button>
  </form>

  {prediction === null && (
    <p className="panel-description">
      Generate a prediction before optimizing cash.
    </p>
  )}

  {optimizationError && (
    <p className="error-message">{optimizationError}</p>
  )}

  {optimizationResult && (
    <div className="result-box">
      <span>Recommended cash allocation</span>
      <strong>{optimizationResult.recommended_cash} units</strong>
      <p>Predicted demand: {optimizationResult.predicted_demand} units</p>
      <p>Available cash: {optimizationResult.available_cash} units</p>
    </div>
  )}
</section>
        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-top"><span>Previous day</span><span className="stat-icon">↗</span></div>
            <h2>{previousDay || '—'}</h2>
            <p>Dataset units</p>
          </article>
          <article className="stat-card">
            <div className="stat-top"><span>Previous week</span><span className="stat-icon">▦</span></div>
            <h2>{previousWeek || '—'}</h2>
            <p>Same day, prior week</p>
          </article>
          <article className="stat-card">
            <div className="stat-top"><span>Weekly average</span><span className="stat-icon">⌁</span></div>
            <h2>{weeklyAverage || '—'}</h2>
            <p>Previous 7-day average</p>
          </article>
          <article className="stat-card prediction-card">
            <div className="stat-top"><span>Predicted demand</span><span className="stat-icon">✦</span></div>
            <h2>{prediction === null ? '—' : prediction}</h2>
            <p>{prediction === null ? 'Run a prediction to see result' : 'Predicted dataset units'}</p>
          </article>
        </section>

        <section className="content-grid">
          <article className="panel prediction-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">MACHINE LEARNING</p>
                <h2>Predict cash demand</h2>
              </div>
              <span className="model-badge">KNN MODEL</span>
            </div>

            <p className="panel-description">
              Enter the recent withdrawal values. The trained model will estimate demand using these three features.
            </p>

            <form onSubmit={predictDemand}>
              <label>
                Previous day withdrawals
                <input type="number" step="any" min="0" required value={previousDay}
                  onChange={(e) => setPreviousDay(e.target.value)} />
              </label>
              <label>
                Previous week withdrawals
                <input type="number" step="any" min="0" required value={previousWeek}
                  onChange={(e) => setPreviousWeek(e.target.value)} />
              </label>
              <label>
                Previous 7-day average
                <input type="number" step="any" min="0" required value={weeklyAverage}
                  onChange={(e) => setWeeklyAverage(e.target.value)} />
              </label>

              <button className="predict-button" type="submit" disabled={loading}>
                {loading ? 'Calculating...' : '✦  Predict Cash Demand'}
              </button>
            </form>

            {error && <p className="error-message">{error}</p>}

            {prediction !== null && (
              <div className="result-box">
                <span>Estimated withdrawal demand</span>
                <strong>{prediction} units</strong>
                <p>This is a model estimate, not a guaranteed cash requirement.</p>
              </div>
            )}
          </article>

          <article className="panel insights-panel">
            <p className="eyebrow">MODEL OVERVIEW</p>
            <h2>Performance snapshot</h2>

            <div className="metric-row">
              <div><span>Algorithm</span><strong>K-Nearest Neighbours</strong></div>
              <span className="metric-icon">ML</span>
            </div>
            <div className="metric-row">
              <div><span>Selected neighbours</span><strong>K = 7</strong></div>
              <span className="metric-icon">07</span>
            </div>
            <div className="metric-row">
  <div>
    <span>Test MAE</span>
    <strong>4.9364</strong>
    <p className="metric-description">
      Average absolute prediction error on test data.
    </p>
  </div>
  <span className="metric-icon">↘</span>
</div>
            <div className="metric-row">
  <div>
    <span>Test RMSE</span>
    <strong>6.2783</strong>
    <p className="metric-description">
      Penalizes larger prediction errors more heavily.
    </p>
  </div>
  <span className="metric-icon">∿</span>
</div>

            <div className="note-box">
              <strong>About this prototype</strong>
              <p>Trained on the T1 ATM time series. Metrics describe the current test split and may not generalise to other ATMs.</p>
            </div>
          </article>
        </section>

        <footer>
          <span>ATM Insight · Academic forecasting prototype</span>
          <span>React + FastAPI + Scikit-learn</span>
        </footer>
    </main>
</div>
    )}
  </>
  )
}

export default App