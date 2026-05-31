import { useState } from 'react';
import MyQRCode from './components/MyQRCode';
import QRScanner from './components/QRScanner';
import Toast from './components/Toast';
import { QrCode, ScanLine } from 'lucide-react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('myqr');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="app-container">
      <header className="app-header glass-panel">
        <h1 className="logo">AccLink</h1>
        <nav className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'myqr' ? 'active' : ''}`}
            onClick={() => setActiveTab('myqr')}
          >
            <QrCode size={20} />
            내 QR
          </button>
          <button 
            className={`tab-btn ${activeTab === 'scan' ? 'active' : ''}`}
            onClick={() => setActiveTab('scan')}
          >
            <ScanLine size={20} />
            스캔
          </button>
        </nav>
      </header>
      
      <main className="app-main">
        {activeTab === 'myqr' ? (
          <MyQRCode showToast={showToast} />
        ) : (
          <QRScanner showToast={showToast} />
        )}
      </main>

      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
}

export default App;
