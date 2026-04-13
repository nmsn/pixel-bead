# 深色/浅色主题切换设计

> **状态**: 审查中

## 目标

为 pixel-bead 应用添加深色/浅色主题切换功能，用户可一键切换整个 UI 的颜色方案，偏好持久化到 localStorage。

## 架构

利用 Tailwind v4 的 `@theme` 块 + CSS 自定义属性。浅色为默认样式，深色通过 `.dark` class 覆盖变量值。切换 `<html>` 元素的 `.dark` class 来控制主题。

## 实现方案

### 1. CSS 变量 (index.css)

浅色作为默认值写在 `@theme` 块中，深色通过 `.dark` class 覆盖：

```css
@theme {
  /* 浅色模式（默认） */
  --color-bg: #fafafa;
  --color-surface: #ffffff;
  --color-border: #e4e4e7;
  --color-text-primary: #18181b;
  --color-text-secondary: #71717a;
  --color-accent: #6366f1;
  --color-canvas-bg: #f4f4f5;
}

.dark {
  /* 深色模式覆盖 */
  --color-bg: #0a0a0b;
  --color-surface: #141416;
  --color-border: #2a2a2e;
  --color-text-primary: #e4e4e7;
  --color-text-secondary: #71717a;
  --color-canvas-bg: #18181b;
}
```

### 2. 主题切换机制 (App.tsx)

初始化时从 localStorage 读取偏好，切换时同时更新状态、DOM class 和 localStorage：

```tsx
// 初始化
useEffect(() => {
  const saved = localStorage.getItem('pixel-bead-is-dark');
  const isDark = saved !== null ? JSON.parse(saved) : true;
  setIsDark(isDark);
  document.documentElement.classList.toggle('dark', isDark);
}, []);

// 切换
const handleThemeToggle = () => {
  const newIsDark = !isDark;
  setIsDark(newIsDark);
  localStorage.setItem('pixel-bead-is-dark', JSON.stringify(newIsDark));
  document.documentElement.classList.toggle('dark', newIsDark);
};
```

### 3. 组件样式替换规则

将硬编码的颜色值替换为 CSS 变量：

| 原值 | 替换为 |
|------|--------|
| `#0a0a0b` | `var(--color-bg)` |
| `#141416` | `var(--color-surface)` |
| `#2a2a2e` | `var(--color-border)` |
| `#e4e4e7` | `var(--color-text-primary)` |
| `#71717a` | `var(--color-text-secondary)` |
| `#18181b` | `var(--color-canvas-bg)` |

画布内部的像素网格颜色由 PALETTE 定义，不受主题影响。

### 涉及文件

| 文件 | 改动 |
|------|------|
| `apps/web/src/index.css` | 重写 @theme 为浅色默认，添加 .dark 覆盖块 |
| `apps/web/src/App.tsx` | 添加初始化读取和切换逻辑 |
| `apps/web/src/components/toolbar/TopToolbar.tsx` | 替换所有硬编码颜色为 CSS 变量 |
| `apps/web/src/components/panels/FramePanel.tsx` | 替换所有硬编码颜色为 CSS 变量 |
| `apps/web/src/components/panels/ExportPanel.tsx` | 替换所有硬编码颜色为 CSS 变量 |
| `apps/web/src/components/panels/ColorPalette.tsx` | 替换所有硬编码颜色为 CSS 变量 |
| `apps/web/src/components/panels/SelectionPanel.tsx` | 替换所有硬编码颜色为 CSS 变量 |
| `apps/web/src/components/canvas/PixelCanvas.tsx` | 检查并替换硬编码颜色（如有） |

## 实施步骤

1. 修改 `index.css`，重写为浅色默认 + `dark:` 覆盖
2. 修改 `App.tsx`，添加初始化读取和切换逻辑
3. 逐个检查并更新 TopToolbar、FramePanel、ExportPanel、ColorPalette、SelectionPanel 中的硬编码颜色
4. 检查 PixelCanvas 是否有需要替换的颜色
5. 测试深色/浅色切换是否正确
6. 测试 localStorage 持久化

## 注意事项

- 首次加载时默认为深色（`isDark: true`），与当前 UI 保持一致
- Toggle 按钮本身也需要使用 CSS 变量来实现主题适配
- 纯白/纯黑等像素色板颜色不受主题影响
