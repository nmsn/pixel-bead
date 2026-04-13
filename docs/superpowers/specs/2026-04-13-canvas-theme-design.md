# 画布主题适配设计

> **状态**: 已批准

## 目标

将画布区域的背景色和网格边框颜色纳入主题系统，深色/浅色模式下自动切换。

## 实现方案

### 1. PixelCanvas 组件 (PixelCanvas.tsx)

添加 `isDark: boolean` prop，通过 Leafer 的 `background` 属性和动态颜色值实现主题适配。

#### Leafer 背景色

```tsx
const app = new Leafer({
  view: containerRef.current,
  width: CANVAS_SIZE,
  height: CANVAS_SIZE,
  background: isDark ? '#18181b' : '#f4f4f5',
});
```

#### 网格线颜色

深色模式：`rgba(255,255,255,0.1)`
浅色模式：`rgba(0,0,0,0.1)`

#### 行列标签颜色

深色模式：`rgba(255,255,255,0.5)`
浅色模式：`rgba(0,0,0,0.4)`

### 2. 画布区域容器 (App.tsx)

容器 div 添加 `bg-canvas-bg` class，响应主题背景色。

### 涉及文件

| 文件 | 改动 |
|------|------|
| `apps/web/src/components/canvas/PixelCanvas.tsx` | 添加 isDark prop，Leafer 背景 + 网格/标签颜色 |
| `apps/web/src/App.tsx` | 传入 isDark 给 PixelCanvas，容器添加 bg-canvas-bg |

## 实施步骤

1. PixelCanvas 添加 `isDark` prop
2. Leafer 初始化时使用 `isDark` 设置 background
3. 网格线和标签颜色根据 `isDark` 动态设置
4. App.tsx 传入 `isDark`，容器 div 添加 `bg-canvas-bg`
