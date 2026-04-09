
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
              className="w-full h-[60px] bg-[#006D37] text-white rounded-[8px] font-['Inter'] font-bold text-[18px] shadow-lg transition-transform hover:-translate-y-1"
            >
              ↩️ Carry Forward
            </button>
          )}
          <button
            onClick={onEndSession}
            className="w-full h-[60px] bg-[#FAFAFA] border-2 border-[#DC2626] text-[#DC2626] rounded-[8px] font-['Inter'] font-bold text-[18px] transition-colors hover:bg-[#DC2626] hover:text-white"
          >
            🛑 End Session
          </button>
          <button
            onClick={onClose}
            className="w-full h-[40px] text-[#1A1A1A]/60 font-['Inter'] font-medium text-[16px] hover:text-[#1A1A1A] transition-colors mt-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
