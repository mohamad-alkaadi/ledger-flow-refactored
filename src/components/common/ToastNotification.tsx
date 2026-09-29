import { CheckCircle, X } from "lucide-react";

const ToastNotification = ({
  toastMessage,
  setToastMessage,
}: {
  toastMessage: any;
  setToastMessage: any;
}) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
      <span className="text-xs font-medium">{toastMessage}</span>
      <button
        onClick={() => setToastMessage(null)}
        className="text-slate-400 hover:text-white ml-2"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default ToastNotification;
