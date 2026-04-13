# 面板折叠功能设计

> **状态**: 已批准

## 目标

为 FramePanel 和 ExportPanel 添加折叠功能，用户可收起/展开面板内容，优化空间利用。

## 实现方案

### 状态管理

每个面板独立管理折叠状态，使用 `useState<boolean>`，默认展开 `true`。

```tsx
const [isExpanded, setIsExpanded] = useState(true);
```

### FramePanel 折叠

在标题栏右侧添加 ▼/▶ 按钮：

```tsx
<div className="p-4 border-b border-border flex items-center justify-between">
  <h2 className="text-sm font-medium text-text-primary">背景设置</h2>
  <button
    onClick={() => setIsExpanded(!isExpanded)}
    className="text-text-secondary hover:text-text-primary"
  >
    {isExpanded ? '▼' : '▶'}
  </button>
</div>

{isExpanded && (
  <div className="p-4 space-y-4">
    {/* 内容 */}
  </div>
)}
```

### ExportPanel 折叠

同上，在 "Export" 标题栏右侧添加按钮。

### 涉及文件

| 文件 | 改动 |
|------|------|
| `apps/web/src/components/panels/FramePanel.tsx` | 添加 isExpanded state + 标题栏折叠按钮 |
| `apps/web/src/components/panels/ExportPanel.tsx` | 添加 isExpanded state + 标题栏折叠按钮 |

## 实施步骤

1. FramePanel 添加折叠功能
2. ExportPanel 添加折叠功能
