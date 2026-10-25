import type { FixturePart } from "../lib/types.js";

interface Props {
  parts: FixturePart[];
  color: string;
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  start: number,
  end: number,
): string {
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  const large = Math.abs(end - start) > Math.PI ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

export function FixtureGlyph({ parts, color }: Props) {
  return (
    <g>
      {parts.map((part, index) => {
        if (part.kind === "line") {
          const points = part.points
            .map((point) => `${point.x},${point.y}`)
            .join(" ");
          if (part.closed) {
            return (
              <polygon
                key={index}
                points={points}
                fill={part.fill ? color : "none"}
                stroke={part.stroke ? color : "none"}
                strokeWidth={1.1}
                strokeLinejoin="round"
              />
            );
          }
          return (
            <polyline
              key={index}
              points={points}
              fill={part.fill ? color : "none"}
              stroke={part.stroke ? color : "none"}
              strokeWidth={1.1}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        }
        if (part.kind === "circle") {
          return (
            <circle
              key={index}
              cx={part.cx}
              cy={part.cy}
              r={part.r}
              fill={part.fill ? color : "none"}
              stroke={part.stroke ? color : "none"}
              strokeWidth={1.1}
            />
          );
        }
        if (part.kind === "arc") {
          return (
            <path
              key={index}
              d={arcPath(part.cx, part.cy, part.r, part.start, part.end)}
              fill={part.fill ? color : "none"}
              stroke={part.stroke ? color : "none"}
              strokeWidth={1.1}
              strokeLinecap="round"
            />
          );
        }
        if (part.kind === "rect") {
          return (
            <rect
              key={index}
              x={part.x}
              y={part.y}
              width={part.w}
              height={part.h}
              fill={part.fill ? color : "none"}
              stroke={part.stroke ? color : "none"}
              strokeWidth={1.1}
            />
          );
        }
        return (
          <text
            key={index}
            x={part.x}
            y={part.y}
            fontSize={part.size ?? 5}
            fontWeight={part.weight === "bold" ? 700 : 400}
            fill={color}
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            textAnchor="middle"
          >
            {part.text}
          </text>
        );
      })}
    </g>
  );
}
