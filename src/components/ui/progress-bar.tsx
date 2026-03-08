interface ProgressBarProps {
  current: number;
  target: number;
  label?: string;
}

export default function ProgressBar({ current, target, label }: ProgressBarProps) {
  const percentage = Math.min(Math.round((current / target) * 100), 100);

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label || `${current}/${target}명 참여`}</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
