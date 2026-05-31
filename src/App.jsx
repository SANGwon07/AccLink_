import { useState, useEffect } from 'react';
import MyQRCode from './components/MyQRCode';
import QRScanner from './components/QRScanner';
import Toast from './components/Toast';
import SavedAccountsModal from './components/SavedAccountsModal';
import { QrCode, ScanLine, Menu, Sun, Moon } from 'lucide-react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('scan');
  const [toastMessage, setToastMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('acclink_theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('acclink_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="app-container">
      <header className="app-header glass-panel">
        <div className="header-top">
          <h1 className="logo">AccLink</h1>
          <div className="header-actions">
            <button className="icon-btn" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="icon-btn" onClick={() => setIsModalOpen(true)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
        <nav className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'scan' ? 'active' : ''}`}
            onClick={() => setActiveTab('scan')}
          >
            <ScanLine size={20} />
            스캔
          </button>
          <button 
            className={`tab-btn ${activeTab === 'myqr' ? 'active' : ''}`}
            onClick={() => setActiveTab('myqr')}
          >
            <QrCode size={20} />
            내 QR
          </button>
        </nav>
      </header>
      
      <main className="app-main">
        {activeTab === 'scan' ? (
          <QRScanner showToast={showToast} />
        ) : (
          <MyQRCode showToast={showToast} />
        )}
      </main>

      {toastMessage && <Toast message={toastMessage} />}
      {isModalOpen && <SavedAccountsModal onClose={() => setIsModalOpen(false)} showToast={showToast} />}
    </div>
  );
}

export default App;
