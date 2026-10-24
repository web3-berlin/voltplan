import type { ElectricalSymbolDef, SymbolPart } from "../lib/types.js";

function renderPart(part: SymbolPart, index: number) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.1,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (part.kind) {
    case "line": {
      const points = part.points
        .map((point) => `${point.x},${point.y}`)
        .join(" ");
      const Tag = part.closed ? "polygon" : "polyline";
      return (
        <Tag
          key={index}
          points={points}
          {...common}
          fill={part.closed && part.fill !== false ? "white" : "none"}
        />
      );
    }
    case "circle":
      return (
        <circle
          key={index}
          cx={part.cx}
          cy={part.cy}
          r={part.r}
          {...common}
          fill={part.fill === false ? "none" : "white"}
        />
      );
    case "arc": {
      const startX = part.cx + part.r * Math.cos(part.start);
      const startY = part.cy + part.r * Math.sin(part.start);
      const endX = part.cx + part.r * Math.cos(part.end);
      const endY = part.cy + part.r * Math.sin(part.end);
      const sweep = part.end > part.start ? 1 : 0;
      const large = Math.abs(part.end - part.start) > Math.PI ? 1 : 0;
      return (
        <path
          key={index}
          d={`M ${startX} ${startY} A ${part.r} ${part.r} 0 ${large} ${sweep} ${endX} ${endY}`}
          {...common}
        />
      );
    }
    case "rect":
      return (
        <rect
          key={index}
          x={part.x}
          y={part.y}
          width={part.w}
          height={part.h}
          {...common}
          fill={part.fill === false ? "none" : "white"}
        />
      );
    case "text":
      return (
        <text
          key={index}
          x={part.x}
          y={part.y}
          textAnchor="middle"
          dominantBaseline="central"
          fill="currentColor"
          stroke="none"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize={part.size ?? 5}
          fontWeight={part.weight ?? "bold"}
        >
          {part.text}
        </text>
      );
  }
}

export function SymbolGlyph({
  def,
  color = "currentColor",
  className,
}: {
  def: ElectricalSymbolDef;
  color?: string;
  className?: string;
}) {
  return (
    <g className={className} color={color}>
      {def.parts.map(renderPart)}
    </g>
  );
}
