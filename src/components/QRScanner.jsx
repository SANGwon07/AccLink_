import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, RefreshCw, CheckCircle } from 'lucide-react';
import './QRScanner.css';

export default function QRScanner({ showToast }) {
  const [cameras, setCameras] = useState([]);
  const [currentCameraId, setCurrentCameraId] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showSuccessMark, setShowSuccessMark] = useState(false);
  const [saveAccount, setSaveAccount] = useState(true);
  
  const scannerRef = useRef(null);

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
        .then(() => showToast('계좌번호가 복사되었습니다!'))
        .catch(() => {
           if (fallbackCopyTextToClipboard(text)) showToast('계좌번호가 복사되었습니다!');
           else showToast('복사에 실패했습니다.');
        });
    } else {
      if (fallbackCopyTextToClipboard(text)) showToast('계좌번호가 복사되었습니다!');
      else showToast('복사에 실패했습니다.');
    }
  };

  const saveToLocalStorage = (data) => {
    try {
      const saved = localStorage.getItem('acclink_saved_accounts');
      const accounts = saved ? JSON.parse(saved) : [];
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
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length) {
        setCameras(devices);
        // default to back camera (usually last one)
        setCurrentCameraId(devices[devices.length - 1].id);
      }
    }).catch(err => {
      console.error("Error getting cameras", err);
      showToast("카메라 권한을 허용해주세요.");
    });
    
    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        setIsScanning(false);
      } catch (e) {
        console.error("Failed to stop scanner", e);
      }
    }
  };

  const startScanner = async (cameraId) => {
    if (!cameraId) return;
    
    try {
      if (scannerRef.current && isScanning) {
        await stopScanner();
      }

      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        cameraId,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => handleScanSuccess(decodedText, html5QrCode),
        () => {} // ignore frame errors
      );
      setIsScanning(true);
    } catch (err) {
      console.error("Error starting scanner", err);
    }
  };

  const handleScanSuccess = (decodedText, html5QrCode) => {
    if (showSuccessMark) return;

    try {
      const data = JSON.parse(decodedText);
      if (data.bank && data.account) {
        if (html5QrCode.getState() === 2) { // 2 = scanning
          html5QrCode.pause();
        }

        const amountStr = data.amount ? ` [${data.amount.toLocaleString()}원]` : '';
        const textToCopy = `${data.bank} ${data.account}${amountStr}`;
        copyToClipboard(textToCopy);
        
        if (saveAccount) {
          saveToLocalStorage(data);
        }

        setShowSuccessMark(true);
        setTimeout(() => {
          setShowSuccessMark(false);
          if (html5QrCode.getState() === 3) { // 3 = paused
             html5QrCode.resume();
          }
        }, 1500);
      }
    } catch (e) {
      // Not our JSON
    }
  };

  useEffect(() => {
    if (currentCameraId) {
      startScanner(currentCameraId);
    }
  }, [currentCameraId]);

  const handleSwitchCamera = () => {
    if (cameras.length > 1) {
      const currentIndex = cameras.findIndex(c => c.id === currentCameraId);
      const nextIndex = (currentIndex + 1) % cameras.length;
      setCurrentCameraId(cameras[nextIndex].id);
    }
  };

  return (
    <div className="scanner-container glass-panel animate-fade-in">
      <div className="scanner-header">
        <h2 className="title">QR 스캔</h2>
        {cameras.length > 1 && (
          <button className="icon-btn-round" onClick={handleSwitchCamera}>
            <RefreshCw size={20} />
          </button>
        )}
      </div>
      
      <div className="scanner-wrapper mt-4">
        <div id="reader" className="qr-reader"></div>
        
        {showSuccessMark && (
          <div className="success-overlay animate-fade-in">
            <CheckCircle size={80} color="var(--success-color)" />
            <p className="success-text">복사 완료!</p>
          </div>
        )}

        {!isScanning && !showSuccessMark && cameras.length > 0 && (
          <div className="loading-overlay">
            <Camera size={40} className="animate-pulse" />
            <p>카메라 준비 중...</p>
          </div>
        )}
      </div>
      
      <p className="hint text-center mt-4">카메라 영역에 QR 코드를 비춰주세요.</p>

      <label className="save-checkbox-container justify-center mt-4">
        <input 
          type="checkbox" 
          checked={saveAccount} 
          onChange={(e) => setSaveAccount(e.target.checked)} 
        />
        <span>스캔한 계좌를 내 목록에 저장하기</span>
      </label>
    </div>
  );
}
