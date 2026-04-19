import { useEffect } from 'react';

interface AbandonSessionModalProps {
  task: string | null;
  onCarryForward: () => void;
  onEndSession: () => void;
  onClose: () => void;
}

export default function AbandonSessionModal({
  task,
  onCarryForward,
  onEndSession,
  onClose,
}: AbandonSessionModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/80 backdrop-blur-sm px-4" 
      onClick={onClose}
    >
      <div 
        className="bg-[#FAFAFA] rounded-[32px] w-full max-w-md p-10 flex flex-col items-center text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-['Space_Grotesk'] font-bold text-[32px] text-[#1A1A1A] mb-2 leading-tight">
          Abandon Session? 🌱
        </h3>
        
        {task ? (
          <p className="font-['Inter'] text-[18px] text-[#1A1A1A]/80 mb-8">
            Your focus session for <strong className="text-[#006D37]">{task}</strong> isn't complete yet.
          </p>
        ) : (
          <p className="font-['Inter'] text-[18px] text-[#1A1A1A]/80 mb-8">
            Your focus session isn't complete yet.
          </p>
        )}
        
        <div className="flex flex-col gap-4 w-full">
          {task && (
            <button
              onClick={onCarryForward}
              className="w-full h-[60px] bg-[#006D37] text-white rounded-[8px] font-['Inter'] font-bold text-[18px] shadow-lg transition-all duration-200 ease-out active:scale-[0.97] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ↩️ Carry Forward
            </button>
          )}
          <button
            onClick={onEndSession}
            className="w-full h-[60px] bg-[#FAFAFA] border-2 border-[#DC2626] text-[#DC2626] rounded-[8px] font-['Inter'] font-bold text-[18px] hover:bg-[#DC2626] hover:text-white transition-all duration-200 ease-out active:scale-[0.97] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🛑 End Session
          </button>
          <button
            onClick={onClose}
            className="w-full h-[40px] text-[#1A1A1A]/60 font-['Inter'] font-medium text-[16px] hover:text-[#1A1A1A] mt-2 transition-all duration-200 ease-out active:scale-[0.97] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
