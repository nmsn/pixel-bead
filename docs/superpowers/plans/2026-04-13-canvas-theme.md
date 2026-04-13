# 画布主题适配实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将画布背景和网格线颜色纳入主题系统，支持深色/浅色自动切换

**Architecture:** PixelCanvas 接收 `isDark` prop，通过 Leafer background 属性和动态颜色值实现主题适配。App.tsx 传入状态并设置容器背景。

**Tech Stack:** React, Leafer UI

---

## 任务 1: PixelCanvas 添加 isDark prop 并实现主题颜色

**文件:**
- 修改: `apps/web/src/components/canvas/PixelCanvas.tsx`

### Step 1: 添加 isDark prop

在 `PixelCanvasProps` 接口添加:
```tsx
isDark: boolean;
```

### Step 2: Leafer 背景色

在 Leafer 初始化处（line ~70）添加 background:
```tsx
const app = new Leafer({
  view: containerRef.current,
  width: CANVAS_SIZE,
  height: CANVAS_SIZE,
  background: isDark ? '#18181b' : '#f4f4f5',
});
```

### Step 3: 网格线颜色动态化

在 `rebuildCanvas` 函数中（line ~299-316），网格线 stroke 改为：
```tsx
stroke: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
```

在 zoom/panOffset effect 中（line ~173-187），同样更新网格线颜色为上述动态值。

### Step 4: 行列标签颜色动态化

在 `rebuildCanvas` 函数中（line ~329, line ~345）：
- 列标签：`fill: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'`
- 行标签：同上

在 zoom/panOffset effect 中（line ~203, line ~219）：同样更新为上述动态值。

### Step 5: 提交

```bash
git add apps/web/src/components/canvas/PixelCanvas.tsx && git commit -m "feat: add isDark prop and theme colors to PixelCanvas"
```

---

## 任务 2: App.tsx 传入 isDark 并设置容器背景

**文件:**
- 修改: `apps/web/src/App.tsx`

### Step 1: 传入 isDark 给 PixelCanvas

在 `<PixelCanvas>` 组件处（line ~318）添加 prop:
```tsx
isDark={isDark}
```

### Step 2: 容器 div 添加背景 class

在 canvas area 容器 div（line ~288）：
```tsx
<div
  className="flex-1 flex items-start justify-center pt-8 bg-canvas-bg"
  ...
>
```

### Step 3: 提交

```bash
git add apps/web/src/App.tsx && git commit -m "feat: wire isDark to PixelCanvas and add canvas-bg container"
```
