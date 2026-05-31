import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Edit2, Save, Plus, ArrowLeft, Trash2, Calculator, Users } from 'lucide-react';
import './MyQRCode.css';

export default function MyQRCode({ showToast }) {
  const [accounts, setAccounts] = useState([]);
  // 'list', 'form', 'view'
  const [viewMode, setViewMode] = useState('list');
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    alias: '', bank: '', account: '', name: ''
  });

  // View State
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isDutchPay, setIsDutchPay] = useState(false);
  const [manualAmount, setManualAmount] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [peopleCount, setPeopleCount] = useState('2');

  useEffect(() => {
    const saved = localStorage.getItem('acclink_my_accounts');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration from old version which was a single object
      if (!Array.isArray(parsed) && parsed.bank) {
        const migrated = [{ id: Date.now().toString(), alias: '내 계좌', ...parsed }];
        setAccounts(migrated);
        localStorage.setItem('acclink_my_accounts', JSON.stringify(migrated));
      } else {
        setAccounts(parsed);
      }
    }
  }, []);

  const saveAccountsToLocal = (newAccounts) => {
    setAccounts(newAccounts);
    localStorage.setItem('acclink_my_accounts', JSON.stringify(newAccounts));
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveAccount = () => {
    if (!formData.bank || !formData.account) {
      showToast('은행명과 계좌번호를 입력해주세요.');
      return;
    }

    const newAccount = {
      ...formData,
      alias: formData.alias || formData.bank,
      id: editingId || Date.now().toString()
    };

    let newAccounts;
    if (editingId) {
      newAccounts = accounts.map(acc => acc.id === editingId ? newAccount : acc);
    } else {
      newAccounts = [...accounts, newAccount];
    }

    saveAccountsToLocal(newAccounts);
    setViewMode('list');
    showToast('저장되었습니다.');
  };

  const handleDeleteAccount = (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      const newAccounts = accounts.filter(acc => acc.id !== id);
      saveAccountsToLocal(newAccounts);
      showToast('삭제되었습니다.');
    }
  };

  const openForm = (acc = null) => {
    if (acc) {
      setFormData(acc);
      setEditingId(acc.id);
    } else {
      setFormData({ alias: '', bank: '', account: '', name: '' });
      setEditingId(null);
    }
    setViewMode('form');
  };

  const openView = (acc) => {
    setSelectedAccount(acc);
    setManualAmount('');
    setTotalAmount('');
    setPeopleCount('2');
    setIsDutchPay(false);
    setViewMode('view');
  };

  const getComputedAmount = () => {
    if (isDutchPay) {
      const total = parseInt(totalAmount.replace(/,/g, '')) || 0;
      const count = parseInt(peopleCount) || 1;
      return total > 0 && count > 0 ? Math.ceil(total / count) : 0;
    }
    return parseInt(manualAmount.replace(/,/g, '')) || 0;
  };

  const formatNumber = (num) => {
    if (!num) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleNumberInput = (setter) => (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setter(formatNumber(raw));
  };

  const renderList = () => (
    <div className="myqr-container animate-fade-in">
      <div className="list-header">
        <h2 className="title">내 계좌 목록</h2>
        <button className="icon-btn-round" onClick={() => openForm()}>
          <Plus size={20} />
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="empty-state glass-panel">
          <p>등록된 계좌가 없습니다.</p>
          <button className="btn btn-primary mt-4" onClick={() => openForm()}>
            계좌 등록하기
          </button>
        </div>
      ) : (
        <div className="account-list-cards">
          {accounts.map(acc => (
            <div key={acc.id} className="account-card glass-panel cursor-pointer" onClick={() => openView(acc)}>
              <div className="card-top">
                <span className="card-alias">{acc.alias}</span>
                <div className="card-actions" onClick={e => e.stopPropagation()}>
                  <button className="icon-btn-sm" onClick={() => openForm(acc)}>
                    <Edit2 size={16} />
                  </button>
                  <button className="icon-btn-sm delete" onClick={() => handleDeleteAccount(acc.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="card-bottom">
                <span className="card-bank">{acc.bank}</span>
                <span className="card-account">{acc.account}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderForm = () => (
    <div className="myqr-container glass-panel animate-fade-in">
      <div className="form-header">
        <button className="icon-btn-round" onClick={() => setViewMode('list')}>
          <ArrowLeft size={20} />
        </button>
        <h2 className="title mb-0">{editingId ? '계좌 수정' : '새 계좌 등록'}</h2>
        <div style={{width: 36}}></div>
      </div>
      
      <div className="form-group mt-4">
        <label>별명 (선택)</label>
        <input type="text" name="alias" className="input-field" placeholder="예: 토스뱅크 모임통장" value={formData.alias} onChange={handleFormChange} />
      </div>
      <div className="form-group">
        <label>은행명</label>
        <input type="text" name="bank" className="input-field" placeholder="예: 토스뱅크" value={formData.bank} onChange={handleFormChange} />
      </div>
      <div className="form-group">
        <label>계좌번호</label>
        <input type="text" name="account" className="input-field" placeholder="예: 110-123-456789" value={formData.account} onChange={handleFormChange} />
      </div>
      <div className="form-group">
        <label>예금주 (선택)</label>
        <input type="text" name="name" className="input-field" placeholder="예: 홍길동" value={formData.name} onChange={handleFormChange} />
      </div>
      
      <button className="btn btn-primary w-full mt-4" onClick={handleSaveAccount}>
        <Save size={20} />
        저장하기
      </button>
    </div>
  );

  const renderView = () => {
    const computedAmount = getComputedAmount();
    const qrPayload = {
      bank: selectedAccount.bank,
      account: selectedAccount.account,
      name: selectedAccount.name
    };
    if (computedAmount > 0) qrPayload.amount = computedAmount;
    const qrDataString = JSON.stringify(qrPayload);

    return (
      <div className="myqr-container animate-fade-in text-center">
        <div className="view-header">
          <button className="icon-btn-round" onClick={() => setViewMode('list')}>
            <ArrowLeft size={20} />
          </button>
          <h2 className="title mb-0">{selectedAccount.alias}</h2>
          <div style={{width: 36}}></div>
        </div>

        <div className="glass-panel mt-4 p-4">
          <div className="qr-wrapper">
            <div className="qr-box">
              <QRCodeSVG value={qrDataString} size={200} bgColor="#ffffff" fgColor="#0f172a" level="Q" includeMargin={false} />
            </div>
          </div>
          
          <div className="account-details">
            <div className="bank-name">{selectedAccount.bank}</div>
            <div className="account-num">{selectedAccount.account}</div>
            {selectedAccount.name && <div className="account-holder">{selectedAccount.name}</div>}
          </div>
        </div>

        <div className="amount-section glass-panel mt-4 p-4 text-left">
          <div className="tabs mini-tabs mb-4">
            <button className={`tab-btn ${!isDutchPay ? 'active' : ''}`} onClick={() => setIsDutchPay(false)}>
              <Calculator size={16} /> 직접 입력
            </button>
            <button className={`tab-btn ${isDutchPay ? 'active' : ''}`} onClick={() => setIsDutchPay(true)}>
              <Users size={16} /> 더치페이
            </button>
          </div>

          {!isDutchPay ? (
            <div className="form-group">
              <label>요청 금액 (선택)</label>
              <div className="input-with-suffix">
                <input type="text" className="input-field" placeholder="0" value={manualAmount} onChange={handleNumberInput(setManualAmount)} />
                <span>원</span>
              </div>
            </div>
          ) : (
            <div className="dutch-grid">
              <div className="form-group">
                <label>총 금액</label>
                <div className="input-with-suffix">
                  <input type="text" className="input-field" placeholder="0" value={totalAmount} onChange={handleNumberInput(setTotalAmount)} />
                  <span>원</span>
                </div>
              </div>
              <div className="form-group">
                <label>인원수</label>
                <div className="input-with-suffix">
                  <input type="number" className="input-field" placeholder="2" value={peopleCount} onChange={e => setPeopleCount(e.target.value)} />
                  <span>명</span>
                </div>
              </div>
            </div>
          )}

          {computedAmount > 0 && (
            <div className="computed-result mt-4">
              요청 금액: <strong>{formatNumber(computedAmount)}</strong>원
            </div>
          )}
        </div>
      </div>
    );
  };

  if (viewMode === 'form') return renderForm();
  if (viewMode === 'view') return renderView();
  return renderList();
}
