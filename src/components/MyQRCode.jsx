import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Edit2, Save } from 'lucide-react';
import './MyQRCode.css';

export default function MyQRCode({ showToast }) {
  const [isEditing, setIsEditing] = useState(false);
  const [accountInfo, setAccountInfo] = useState({
    bank: '',
    account: '',
    name: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('acclink_info');
    if (saved) {
      setAccountInfo(JSON.parse(saved));
    } else {
      setIsEditing(true);
    }
  }, []);

  const handleChange = (e) => {
    setAccountInfo({ ...accountInfo, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!accountInfo.bank || !accountInfo.account) {
      showToast('은행명과 계좌번호를 입력해주세요.');
      return;
    }
    localStorage.setItem('acclink_info', JSON.stringify(accountInfo));
    setIsEditing(false);
    showToast('저장되었습니다.');
  };

  const qrData = JSON.stringify(accountInfo);

  if (isEditing) {
    return (
      <div className="myqr-container glass-panel animate-fade-in">
        <h2 className="title">계좌 정보 입력</h2>
        <p className="subtitle">상대방에게 공유할 계좌 정보를 입력하세요.</p>
        
        <div className="form-group">
          <label>은행명</label>
          <input 
            type="text" 
            name="bank" 
            className="input-field" 
            placeholder="예: 토스뱅크, 신한은행" 
            value={accountInfo.bank} 
            onChange={handleChange} 
          />
        </div>
        <div className="form-group">
          <label>계좌번호</label>
          <input 
            type="text" 
            name="account" 
            className="input-field" 
            placeholder="예: 110-123-456789" 
            value={accountInfo.account} 
            onChange={handleChange} 
          />
        </div>
        <div className="form-group">
          <label>예금주 (선택)</label>
          <input 
            type="text" 
            name="name" 
            className="input-field" 
            placeholder="예: 홍길동" 
            value={accountInfo.name} 
            onChange={handleChange} 
          />
        </div>
        
        <button className="btn btn-primary w-full mt-4" onClick={handleSave}>
          <Save size={20} />
          저장하기
        </button>
      </div>
    );
  }

  return (
    <div className="myqr-container glass-panel animate-fade-in text-center">
      <div className="qr-header">
        <h2 className="title">나의 QR 코드</h2>
        <button className="icon-btn" onClick={() => setIsEditing(true)}>
          <Edit2 size={18} />
        </button>
      </div>
      
      <div className="qr-wrapper">
        <div className="qr-box">
          <QRCodeSVG 
            value={qrData} 
            size={200} 
            bgColor="#ffffff" 
            fgColor="#0f172a" 
            level="Q" 
            includeMargin={false}
          />
        </div>
      </div>
      
      <div className="account-details">
        <div className="bank-name">{accountInfo.bank}</div>
        <div className="account-num">{accountInfo.account}</div>
        {accountInfo.name && <div className="account-holder">{accountInfo.name}</div>}
      </div>
      
      <p className="hint">이 화면을 보여주면 상대방이 계좌번호를 스캔할 수 있습니다.</p>
    </div>
  );
}
