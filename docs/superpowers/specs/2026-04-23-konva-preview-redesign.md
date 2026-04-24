# Konva 预览组件重构设计方案

## 概述

将预览组件的绘制方案从 Canvas 2D 替换为 react-konva，实现：
- 背景占满展示区域
- 像素画布支持拖拽和缩放
- 预览组件不显示格子分割线

## 架构设计

### Konva 层级结构

```
Stage (Stage)
├── Layer 1: 背景层 (Layer)
│   └── Rect (背景色/渐变，填充满容器)
├── Layer 2: 像素层 (Layer)
│   └── Rect[] (每个格子一个矩形，无边框)
└── Layer 3: 光泽层 (Layer)
    └── Rect (半透明渐变叠加)
```

### 关键实现

#### 1. 背景层
```tsx
<Rect
  x={0}
  y={0}
  width={containerWidth}
  height={containerHeight}
  fillLinearGradientStartPoint={{ x: 0, y: 0 }}
  fillLinearGradientEndPoint={{ x: width, y: height }}
  fillLinearGradientColorStops={[0, '#667eea', 1, '#764ba2']}
/>
```

#### 2. 像素层（无格子线）
```tsx
cells.map((cell) => (
  <Rect
    key={cell.key}
    x={cell.x}
    y={cell.y}
    width={cellSize}
    height={cellSize}
    fill={cell.fill}
    listening={false}  // 仅展示，不可交互
  />
))
```

#### 3. 拖拽和缩放
使用 Konva Transformer 实现：

```tsx
import { Transformer } from 'react-konva';

// Stage 配置
<Stage
  draggable
  onWheel={handleWheel}
  scaleX={scale}
  scaleY={scale}
/>

// Transformer 用于缩放
const handleWheel = (e: KonvaEvent) => {
  e.evt.preventDefault();
  const stage = e.target.getStage();
  const oldScale = stage.scaleX();
  const pointer = stage.getPointerPosition();
  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
  };
  const direction = e.evt.deltaY > 0 ? -1 : 1;
  const scaleBy = 1.1;
  const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
  stage.scale({ x: newScale, y: newScale });
};
```

#### 4. 双击重置
```tsx
onDblClick={() => {
  stage.scale({ x: 1, y: 1 });
  stage.position({ x: 0, y: 0 });
}}
```

## 组件 Props

```typescript
interface KonvaPreviewProps {
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
```

## 导出渲染

导出时使用 `toIco.ts` 中的 `renderToCanvas` 函数，生成 PNG 后绘制到 Konva Stage 进行展示预览。

## 文件变更

- 新增: `apps/web/src/components/preview/KonvaPreview.tsx`
- 修改: `apps/web/src/components/panels/ExportPanel.tsx` (使用 KonvaPreview 替代原来的 canvas)

## 交互设计

| 操作 | 效果 |
|------|------|
| 鼠标拖拽 | 画布平移 |
| 滚轮 | 缩放（以鼠标位置为中心） |
| 双击 | 重置缩放和平移到初始状态 |

## 限制

- 预览组件为只读模式，不支持像素编辑
- 编辑功能仍使用原有的 PixelCanvas 组件