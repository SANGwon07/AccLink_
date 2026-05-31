import { useEffect, useState } from 'react';
import { X, Copy, Trash2 } from 'lucide-react';
import './SavedAccountsModal.css';

export default function SavedAccountsModal({ onClose, showToast }) {
  const [savedAccounts, setSavedAccounts] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('acclink_saved_accounts');
    if (saved) {
      setSavedAccounts(JSON.parse(saved));
    }
  }, []);

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

  const handleCopy = (account) => {
    const textToCopy = `${account.bank} ${account.account}`;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => showToast('계좌번호가 복사되었습니다!'))
        .catch(() => {
           if (fallbackCopyTextToClipboard(textToCopy)) {
             showToast('계좌번호가 복사되었습니다!');
           } else {
             showToast('복사에 실패했습니다.');
           }
        });
    } else {
      if (fallbackCopyTextToClipboard(textToCopy)) {
        showToast('계좌번호가 복사되었습니다!');
      } else {
        showToast('복사에 실패했습니다.');
      }
    }
  };

  const handleDelete = (index) => {
    const updated = savedAccounts.filter((_, i) => i !== index);
    setSavedAccounts(updated);
    localStorage.setItem('acclink_saved_accounts', JSON.stringify(updated));
    showToast('삭제되었습니다.');
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content glass-panel animate-slide-up">
        <div className="modal-header">
          <h2>저장된 계좌 관리</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="account-list">
          {savedAccounts.length === 0 ? (
            <p className="empty-text">저장된 계좌가 없습니다.</p>
          ) : (
            savedAccounts.map((acc, idx) => (
              <div key={idx} className="saved-account-card">
                <div className="saved-info">
                  <span className="saved-bank">{acc.bank}</span>
                  <span className="saved-num">{acc.account}</span>
                  {acc.name && <span className="saved-name">{acc.name}</span>}
                </div>
                <div className="saved-actions">
                  <button className="action-btn" onClick={() => handleCopy(acc)}>
                    <Copy size={18} />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(idx)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
