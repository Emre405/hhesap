import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title = "Emin misiniz?", message = "Bu işlemi gerçekleştirmek istediğinize emin misiniz? Bu işlem geri alınamaz.", confirmText = "Evet, Sil", cancelText = "İptal" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4 border border-gray-100 my-auto">
        <div className="flex items-center space-x-3 text-amber-600">
          <div className="bg-amber-100 p-2.5 rounded-full flex-shrink-0">
            <AlertTriangle size={22} className="text-amber-700" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 leading-tight">{title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">Lütfen işleminizi onaylayın</p>
          </div>
        </div>

        <p className="text-xs text-gray-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
          {message}
        </p>

        <div className="flex space-x-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition active:scale-95"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md transition active:scale-95"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
