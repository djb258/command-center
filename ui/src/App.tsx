import React, { useState, useEffect } from 'react';
import './App.css';

interface ProcessingResult {
  filepath: string;
  type: string;
  content: string;
  summary: string;
  action_items: string[];
  compliance: string[];
  timestamp: string;
  status: string;
  error?: string;
}

interface BridgeStats {
  data_dir: string;
  poll_interval: string;
  known_files: number;
  is_running: boolean;
}

function App() {
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [stats, setStats] = useState<BridgeStats | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket
    const websocket = new WebSocket('ws://localhost:8080/ws');
    
    websocket.onopen = () => {
      console.log('Connected to bridge WebSocket');
      setWsConnected(true);
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'processing_result') {
          setResults(prev => [data.result, ...prev.slice(0, 9)]); // Keep last 10 results
        } else if (data.type === 'stats') {
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    websocket.onclose = () => {
      console.log('Disconnected from bridge WebSocket');
      setWsConnected(false);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWsConnected(false);
    };

    setWs(websocket);

    // Cleanup on unmount
    return () => {
      websocket.close();
    };
  }, []);

  const handleApprove = (result: ProcessingResult) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'approve',
        filepath: result.filepath
      }));
    }
  };

  const handleReject = (result: ProcessingResult) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'reject',
        filepath: result.filepath
      }));
    }
  };

  const handleEdit = (result: ProcessingResult) => {
    // TODO: Implement edit functionality
    console.log('Edit result:', result);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>ScreenPipe Assistant Bridge</h1>
        <div className="status-indicator">
          <span className={`status-dot ${wsConnected ? 'connected' : 'disconnected'}`}></span>
          {wsConnected ? 'Connected' : 'Disconnected'}
        </div>
      </header>

      <main className="App-main">
        <div className="stats-panel">
          <h2>Bridge Status</h2>
          {stats ? (
            <div className="stats-grid">
              <div className="stat-item">
                <label>Data Directory:</label>
                <span>{stats.data_dir}</span>
              </div>
              <div className="stat-item">
                <label>Poll Interval:</label>
                <span>{stats.poll_interval}</span>
              </div>
              <div className="stat-item">
                <label>Known Files:</label>
                <span>{stats.known_files}</span>
              </div>
              <div className="stat-item">
                <label>Status:</label>
                <span className={stats.is_running ? 'running' : 'stopped'}>
                  {stats.is_running ? 'Running' : 'Stopped'}
                </span>
              </div>
            </div>
          ) : (
            <p>Loading stats...</p>
          )}
        </div>

        <div className="results-panel">
          <h2>Processing Results</h2>
          {results.length === 0 ? (
            <p className="no-results">No processing results yet. Start ScreenPipe to see data.</p>
          ) : (
            <div className="results-list">
              {results.map((result, index) => (
                <div key={index} className={`result-card ${result.status}`}>
                  <div className="result-header">
                    <h3>{result.filepath.split('\\').pop()}</h3>
                    <span className={`status-badge ${result.status}`}>
                      {result.status}
                    </span>
                  </div>
                  
                  <div className="result-content">
                    <div className="result-section">
                      <h4>Summary</h4>
                      <p>{result.summary}</p>
                    </div>

                    {result.action_items && result.action_items.length > 0 && (
                      <div className="result-section">
                        <h4>Action Items</h4>
                        <ul>
                          {result.action_items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.compliance && result.compliance.length > 0 && (
                      <div className="result-section">
                        <h4>Compliance Notes</h4>
                        <ul>
                          {result.compliance.map((note, i) => (
                            <li key={i}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.error && (
                      <div className="result-section error">
                        <h4>Error</h4>
                        <p>{result.error}</p>
                      </div>
                    )}
                  </div>

                  <div className="result-actions">
                    <button 
                      onClick={() => handleApprove(result)}
                      className="btn btn-approve"
                      disabled={result.status === 'error'}
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleEdit(result)}
                      className="btn btn-edit"
                      disabled={result.status === 'error'}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleReject(result)}
                      className="btn btn-reject"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App; 