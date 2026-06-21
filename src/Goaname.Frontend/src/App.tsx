import React, { useState } from 'react';

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div style={{ padding: 'var(--gn-space-8)', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--gn-space-8)' }}>
        <h1 style={{ color: 'var(--gn-color-primary)', margin: 0 }}>Goaname Markets</h1>
        <button 
          onClick={toggleTheme}
          style={{
            backgroundColor: 'var(--gn-color-bg-surface)',
            color: 'var(--gn-color-text-primary)',
            border: 'var(--gn-border-width) solid var(--gn-border-color)',
            padding: 'var(--gn-button-padding-y) var(--gn-button-padding-x)',
            borderRadius: 'var(--gn-button-radius)',
            cursor: 'pointer'
          }}
        >
          Toggle Theme ({theme})
        </button>
      </header>

      <div style={{ 
        backgroundColor: 'var(--gn-card-bg)', 
        border: 'var(--gn-card-border)',
        borderRadius: 'var(--gn-card-radius)',
        boxShadow: 'var(--gn-card-shadow)',
        padding: 'var(--gn-space-6)',
        maxWidth: '400px'
      }}>
        <div style={{ fontSize: 'var(--gn-font-size-sm)', color: 'var(--gn-color-text-muted)', marginBottom: 'var(--gn-space-2)' }}>
          SPORTS • ATHLETICS
        </div>
        <h2 style={{ margin: '0 0 var(--gn-space-6) 0', fontSize: 'var(--gn-font-size-xl)' }}>
          Will Ferdinand Omanyala win the 100m race at the Paris Olympics?
        </h2>
        
        <div style={{ display: 'flex', gap: 'var(--gn-space-4)' }}>
          <button style={{
            flex: 1,
            backgroundColor: 'var(--gn-color-odds-yes-bg)',
            color: 'var(--gn-color-odds-yes)',
            border: '1px solid var(--gn-color-odds-yes)',
            padding: 'var(--gn-space-3)',
            borderRadius: 'var(--gn-radius-md)',
            fontWeight: 'var(--gn-font-weight-bold)',
            cursor: 'pointer'
          }}>
            Yes 2.45x
          </button>
          <button style={{
            flex: 1,
            backgroundColor: 'var(--gn-color-odds-no-bg)',
            color: 'var(--gn-color-odds-no)',
            border: '1px solid var(--gn-color-odds-no)',
            padding: 'var(--gn-space-3)',
            borderRadius: 'var(--gn-radius-md)',
            fontWeight: 'var(--gn-font-weight-bold)',
            cursor: 'pointer'
          }}>
            No 1.68x
          </button>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: 'var(--gn-space-4)',
          fontSize: 'var(--gn-font-size-sm)',
          color: 'var(--gn-color-text-secondary)'
        }}>
          <span>Vol: $45,200</span>
          <span>1,204 Traders</span>
        </div>
      </div>
    </div>
  );
}

export default App;