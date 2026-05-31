import { CheckCircle2 } from 'lucide-react';
import './Toast.css';

export default function Toast({ message }) {
  return (
    <div className="toast-container animate-slide-up">
      <div className="toast-content glass-panel">
        <CheckCircle2 color="var(--success-color)" size={20} />
        <span>{message}</span>
      </div>
    </div>
  );
}
