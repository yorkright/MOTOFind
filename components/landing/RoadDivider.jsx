export default function RoadDivider() {
  return (
    <div className="relative h-px w-full overflow-hidden bg-border/60" aria-hidden="true">
      <div className="absolute inset-y-0 left-0 flex w-[200%] animate-[road_3.5s_linear_infinite]">
        <svg className="h-px w-1/2" preserveAspectRatio="none" viewBox="0 0 400 1">
          <line x1="0" y1="0.5" x2="400" y2="0.5" stroke="#F5A623" strokeWidth="1" strokeDasharray="18 14" />
        </svg>
        <svg className="h-px w-1/2" preserveAspectRatio="none" viewBox="0 0 400 1">
          <line x1="0" y1="0.5" x2="400" y2="0.5" stroke="#F5A623" strokeWidth="1" strokeDasharray="18 14" />
        </svg>
      </div>
    </div>
  );
}
