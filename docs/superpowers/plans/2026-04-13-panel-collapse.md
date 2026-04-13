# 面板折叠功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 FramePanel 和 ExportPanel 添加展开/收起按钮，优化面板空间利用

**Architecture:** 每个面板独立管理 `useState<boolean>` 折叠状态，默认展开。标题栏右侧添加 ▼/▶ 按钮。

**Tech Stack:** React, Tailwind CSS

---

## 任务 1: FramePanel 添加折叠功能

**文件:**
- 修改: `apps/web/src/components/panels/FramePanel.tsx`

### Step 1: 添加 useState

在组件顶部添加:
```tsx
const [isExpanded, setIsExpanded] = useState(true);
```

### Step 2: 修改标题栏

将:
```tsx
<div className="p-4 border-b border-border">
  <h2 className="text-sm font-medium text-text-primary">背景设置</h2>
</div>
```

改为:
```tsx
<div className="p-4 border-b border-border flex items-center justify-between">
  <h2 className="text-sm font-medium text-text-primary">背景设置</h2>
  <button
    onClick={() => setIsExpanded(!isExpanded)}
    className="text-text-secondary hover:text-text-primary transition-colors"
  >
    {isExpanded ? '▼' : '▶'}
  </button>
</div>
```

### Step 3: 用条件渲染包裹内容

将 `<div className="p-4 space-y-4">` 及其内容包裹在:
```tsx
{isExpanded && (
  <div className="p-4 space-y-4">
    {/* 内容 */}
  </div>
)}
```

### Step 4: 提交

```bash
git add apps/web/src/components/panels/FramePanel.tsx && git commit -m "feat: add collapse toggle to FramePanel"
```

---

## 任务 2: ExportPanel 添加折叠功能

**文件:**
- 修改: `apps/web/src/components/panels/ExportPanel.tsx`

### Step 1: 添加 useState

```tsx
const [isExpanded, setIsExpanded] = useState(true);
```

### Step 2: 修改标题栏

将:
```tsx
<div className="p-4 border-b border-border">
  <h2 className="text-sm font-medium text-text-primary">Export</h2>
</div>
```

改为:
```tsx
<div className="p-4 border-b border-border flex items-center justify-between">
  <h2 className="text-sm font-medium text-text-primary">Export</h2>
  <button
    onClick={() => setIsExpanded(!isExpanded)}
    className="text-text-secondary hover:text-text-primary transition-colors"
  >
    {isExpanded ? '▼' : '▶'}
  </button>
</div>
```

### Step 3: 用条件渲染包裹内容

将 `<div className="flex-1 overflow-y-auto p-4 space-y-6">` 及其内容包裹在:
```tsx
{isExpanded && (
  <div className="flex-1 overflow-y-auto p-4 space-y-6">
    {/* 内容 */}
  </div>
)}
```

### Step 4: 提交

```bash
git add apps/web/src/components/panels/ExportPanel.tsx && git commit -m "feat: add collapse toggle to ExportPanel"
```
