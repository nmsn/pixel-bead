import { Group, Layer, Rect, Stage } from 'react-konva';
import { useCallback, useRef, useState } from 'react';
import { PALETTE } from '../../lib/palette-256';
import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';

export interface KonvaPreviewProps {
  gridData: number[][];
  gridSize: [number, number];
  backgroundType: 'solid' | 'gradient';
  backgroundColor: string;
  gradientColors: string[];
  gradientAngle: number;
  glossEnabled: boolean;
  glossIntensity: number;
  cornerRadius: number;
  width: number;
  height: number;
}

const INITIAL_SCALE = 1;
const MIN_SCALE = 0.1;
const MAX_SCALE = 10;

function getGradientStops(colors: string[]): number[] {
  const stops: number[] = [];
  for (let i = 0; i < colors.length; i++) {
    stops.push(i / (colors.length - 1));
  }
  return stops;
}

function angleToRadians(angle: number): number {
  return (angle * Math.PI) / 180;
}

export function KonvaPreview({
  gridData,
  gridSize,
  backgroundType,
  backgroundColor,
  gradientColors,
  gradientAngle,
  glossEnabled,
  glossIntensity,
  cornerRadius,
  width,
  height,
}: KonvaPreviewProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const groupRef = useRef<Konva.Group>(null);
  const [scale, setScale] = useState(INITIAL_SCALE);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleWheel = useCallback(
    (e: KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();

      const stage = stageRef.current;
      if (!stage) return;

      const oldScale = scale;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const scaleBy = 1.1;
      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
      const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));

      // Calculate new position to zoom toward mouse position
      const mousePointTo = {
        x: (pointer.x - position.x) / oldScale,
        y: (pointer.y - position.y) / oldScale,
      };

      const newPos = {
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale,
      };

      setScale(clampedScale);
      setPosition(newPos);
    },
    [scale, position]
  );

  const handleContentDragMove = useCallback(() => {
    const group = groupRef.current;
    if (!group) return;
    setPosition({
      x: group.x(),
      y: group.y(),
    });
  }, []);

  const handleDoubleClick = useCallback(() => {
    setScale(INITIAL_SCALE);
    setPosition({ x: 0, y: 0 });
  }, []);

  const [cols, rows] = gridSize;
  const cellWidth = width / cols;
  const cellHeight = height / rows;

  // Build gradient color stops
  const gradientStops =
    backgroundType === 'gradient' ? getGradientStops(gradientColors) : [];

  // Convert angle to radians for gradient
  const angleRad = angleToRadians(gradientAngle ?? 135);
  const sinAngle = Math.sin(angleRad);
  const cosAngle = Math.cos(angleRad);

  // Calculate gradient start/end points based on angle
  const centerX = width / 2;
  const centerY = height / 2;
  const diagonal = Math.sqrt(width * width + height * height) / 2;
  const gradStartX = centerX - cosAngle * diagonal;
  const gradStartY = centerY - sinAngle * diagonal;
  const gradEndX = centerX + cosAngle * diagonal;
  const gradEndY = centerY + sinAngle * diagonal;

  return (
    <div style={{ width, height }}>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onWheel={handleWheel}
        onDblClick={handleDoubleClick}
      >
        {/* Background Layer */}
        <Layer>
          {backgroundType === 'solid' ? (
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill={backgroundColor}
              cornerRadius={cornerRadius}
            />
          ) : (
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fillLinearGradientStartPoint={{ x: gradStartX, y: gradStartY }}
              fillLinearGradientEndPoint={{ x: gradEndX, y: gradEndY }}
              fillLinearGradientColorStops={gradientColors.flatMap((color, i) => [
                gradientStops[i],
                color,
              ])}
              cornerRadius={cornerRadius}
            />
          )}
        </Layer>

        {/* Pixel Layer (draggable / scalable content only) */}
        <Layer>
          <Group
            ref={groupRef}
            x={position.x}
            y={position.y}
            scaleX={scale}
            scaleY={scale}
            draggable
            onDragMove={handleContentDragMove}
          >
            {gridData.map((row, rowIndex) =>
              row.map((colorIndex, colIndex) => {
                // Keep transparent pixels empty so background shows through
                if (colorIndex === -1) return null;

                const color = PALETTE.colors[colorIndex];
                if (!color) return null;

                return (
                  <Rect
                    key={`${rowIndex}-${colIndex}`}
                    x={colIndex * cellWidth}
                    y={rowIndex * cellHeight}
                    width={cellWidth}
                    height={cellHeight}
                    fill={`#${color}`}
                    listening={false}
                  />
                );
              })
            )}
          </Group>
        </Layer>

        {/* Gloss Overlay Layer */}
        {glossEnabled && glossIntensity > 0 && (
          <Layer listening={false}>
            <Rect
              x={0}
              y={0}
              width={width}
              height={height / 2}
              fillLinearGradientStartPoint={{ x: 0, y: 0 }}
              fillLinearGradientEndPoint={{ x: 0, y: height / 2 }}
              fillLinearGradientColorStops={[
                0,
                `rgba(255, 255, 255, ${glossIntensity / 100})`,
                1,
                'rgba(255, 255, 255, 0)',
              ]}
              listening={false}
            />
          </Layer>
        )}
      </Stage>
    </div>
  );
}
