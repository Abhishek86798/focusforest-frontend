interface TreeDisplayProps {
  stage: number;      // 0-4
  glowLevel: number;  // 0-4
  size?: 'sm' | 'md' | 'lg';  
  animate?: boolean;
}

const stageImages: Record<number, string> = {
  0: '/images/tree_stage_0.png',
  1: '/images/tree_stage_1.png',
  2: '/images/tree_stage_2.png',
  3: '/images/tree_stage_3.png',
  4: '/images/tree_stage_4.png',
};

const glowStyles: Record<number, string> = {
  0: '',
  1: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.2))',
  2: 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.4))',
  3: 'drop-shadow(0 0 18px rgba(255, 215, 0, 0.6))',
  4: 'drop-shadow(0 0 24px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 48px rgba(255, 215, 0, 0.3))',
};

const stageNames: Record<number, string> = {
  0: 'Seed',
  1: 'Sprout',
  2: 'Sapling',
  3: 'Young Tree',
  4: 'Full Tree',
};

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-16 h-16',
  lg: 'w-full h-full', // Will be heavily controlled by parent containers for large views
};

export default function TreeDisplay({ stage = 0, glowLevel = 0, size = 'lg', animate = true }: TreeDisplayProps) {
  // Cap the values to avoid missing asset errors
  const safeStage = Math.max(0, Math.min(4, stage));
  const safeGlow = Math.max(0, Math.min(4, glowLevel));

  if (safeStage === 0 && size === 'lg') {
    return (
      <div className={`relative ${animate ? 'transition-all duration-700 ease-in-out' : ''} ${sizeClasses[size]}`}>
        <img
          src="/images/tree_hero.png"
          alt="Grow your tree today"
          className="w-full h-full object-contain opacity-20 grayscale"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center" style={{ fontFamily: "'Inter', sans-serif" }}>
            <p className="text-lg font-medium text-gray-500">Start a session to</p>
            <p className="text-xl font-bold text-emerald-600">grow today's tree 🌱</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${animate ? 'transition-all duration-700 ease-in-out' : ''} ${sizeClasses[size]}`}>
      <img
        src={stageImages[safeStage]}
        alt={stageNames[safeStage]}
        className={`w-full h-full object-contain ${animate ? 'transition-all duration-700' : ''}`}
        style={{ filter: glowStyles[safeGlow] }}
      />
    </div>
  );
}
