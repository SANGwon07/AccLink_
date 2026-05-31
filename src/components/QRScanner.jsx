import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Copy, Save } from 'lucide-react';
import './QRScanner.css';

export default function QRScanner({ showToast }) {
  const [scannedData, setScannedData] = useState(null);
  const [saveAccount, setSaveAccount] = useState(true);

  // Fallback for non-https or non-user-gesture environments
  const fallbackCopyTextToClipboard = (text) => {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => showToast('계좌번호가 클립보드에 복사되었습니다!'))
        .catch(() => {
          if(fallbackCopyTextToClipboard(text)) {
            showToast('계좌번호가 클립보드에 복사되었습니다!');
          } else {
            showToast('복사에 실패했습니다. 버튼을 다시 눌러주세요.');
          }
        });
    } else {
      if(fallbackCopyTextToClipboard(text)) {
        showToast('계좌번호가 클립보드에 복사되었습니다!');
      } else {
        showToast('복사에 실패했습니다. 버튼을 다시 눌러주세요.');
      }
    }
  };

  const saveToLocalStorage = (data) => {
    try {
      const saved = localStorage.getItem('acclink_saved_accounts');
      const accounts = saved ? JSON.parse(saved) : [];
      // Prevent duplicates
      const exists = accounts.find(acc => acc.account === data.account && acc.bank === data.bank);
      if (!exists) {
        accounts.push(data);
        localStorage.setItem('acclink_saved_accounts', JSON.stringify(accounts));
      }
    } catch (e) {
      console.error("Failed to save account", e);
    }
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    const onScanSuccess = (decodedText) => {
      try {
        const data = JSON.parse(decodedText);
        if (data.bank && data.account) {
          setScannedData(data);
          
          // Try auto-copying
          const textToCopy = `${data.bank} ${data.account}`;
          copyToClipboard(textToCopy);

          scanner.clear();
        }
      } catch (e) {
        console.error("Invalid QR format");
      }
    };

    scanner.render(onScanSuccess, (err) => {
      // Ignore scan errors
    });

    return () => {
      scanner.clear().catch(err => console.error("Failed to clear scanner", err));
    };
  }, []); 

  const handleManualCopy = () => {
    if (scannedData) {
      const textToCopy = `${scannedData.bank} ${scannedData.account}`;
      copyToClipboard(textToCopy);
      
      if (saveAccount) {
        saveToLocalStorage(scannedData);
      }
    }
  };

  const handleScanAgain = () => {
    setScannedData(null);
    showToast('스캔 탭을 다시 눌러주세요.');
  };

  return (
    <div className="scanner-container glass-panel animate-fade-in">
      <h2 className="title text-center mb-4">QR 스캔</h2>
      
      {!scannedData ? (
        <div className="scanner-wrapper">
          <div id="reader" className="qr-reader"></div>
          <p className="hint text-center mt-4">카메라로 상대방의 계좌 QR을 비춰주세요.</p>
        </div>
      ) : (
        <div className="result-wrapper animate-slide-up">
          <div className="success-icon">✓</div>
          <h3 className="result-title">스캔 완료!</h3>
          
          <div className="account-card">
            <div className="bank-name">{scannedData.bank}</div>
            <div className="account-num">{scannedData.account}</div>
            {scannedData.name && <div className="account-holder">{scannedData.name}</div>}
          </div>

          <label className="save-checkbox-container mt-4">
            <input 
              type="checkbox" 
              checked={saveAccount} 
              onChange={(e) => setSaveAccount(e.target.checked)} 
            />
            <span>이 계좌를 내 목록에 저장하기</span>
          </label>
          
          <button className="btn btn-primary w-full mt-4" onClick={handleManualCopy}>
            <Copy size={20} />
            복사 및 저장하기
          </button>
          <button className="btn btn-secondary w-full mt-2" onClick={handleScanAgain}>
            다시 스캔하기
          </button>
        </div>
      )}
    </div>
  );
}
