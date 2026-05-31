import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Copy } from 'lucide-react';
import './QRScanner.css';

export default function QRScanner({ showToast }) {
  const [scannedData, setScannedData] = useState(null);

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
          // Auto copy to clipboard
          const textToCopy = `${data.bank} ${data.account}`;
          navigator.clipboard.writeText(textToCopy).then(() => {
            showToast('계좌번호가 클립보드에 복사되었습니다!');
          });
          scanner.clear();
        }
      } catch (e) {
        console.error("Invalid QR format");
      }
    };

    scanner.render(onScanSuccess, (err) => {
      // Ignore scan errors, they happen when no QR is found
    });

    return () => {
      scanner.clear().catch(err => console.error("Failed to clear scanner", err));
    };
  }, [showToast]);

  const handleManualCopy = () => {
    if (scannedData) {
      const textToCopy = `${scannedData.bank} ${scannedData.account}`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('계좌번호가 복사되었습니다!');
      });
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
          
          <button className="btn btn-primary w-full mt-4" onClick={handleManualCopy}>
            <Copy size={20} />
            다시 복사하기
          </button>
          <button className="btn btn-secondary w-full mt-2" onClick={handleScanAgain}>
            다시 스캔하기
          </button>
        </div>
      )}
    </div>
  );
}
