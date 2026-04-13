# 深色/浅色主题切换实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现完整的深色/浅色主题切换，偏好持久化到 localStorage

**Architecture:** 利用 Tailwind v4 的 `@theme` CSS 自定义属性，浅色为默认，深色通过 `.dark` class 覆盖。切换 `<html>` 元素的 `.dark` class 控制主题。

**Tech Stack:** Tailwind CSS v4, React, localStorage

---

## 任务 1: 重写 index.css 主题变量

**文件:**
- 修改: `apps/web/src/index.css:1-11`

- [ ] **Step 1: 重写 @theme 为浅色默认**

```css
@import "tailwindcss";

@theme {
  /* 浅色模式（默认） */
  --color-bg: #fafafa;
  --color-surface: #ffffff;
  --color-border: #e4e4e7;
  --color-text-primary: #18181b;
  --color-text-secondary: #71717a;
  --color-accent: #6366f1;
  --color-canvas-bg: #f4f4f5;
  --color-hover: #e5e5e5;
  --color-hover-border: #d4d4d8;
}

.dark {
  /* 深色模式覆盖 */
  --color-bg: #0a0a0b;
  --color-surface: #141416;
  --color-border: #2a2a2e;
  --color-text-primary: #e4e4e7;
  --color-text-secondary: #71717a;
  --color-canvas-bg: #18181b;
  --color-hover: #3a3a3e;
  --color-hover-border: #3f3f5a;
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/web/src/index.css
git commit -m "feat: add light/dark theme CSS variables"
```

---

## 任务 2: 实现 App.tsx 主题切换逻辑

**文件:**
- 修改: `apps/web/src/App.tsx:22-27` (usePixelCanvas 解构)
- 修改: `apps/web/src/App.tsx:44-52` (useEffect 初始化)
- 修改: `apps/web/src/App.tsx:259-263` (TopToolbar props)

- [ ] **Step 1: 添加初始化逻辑**

在 App.tsx 中添加 useEffect，在组件挂载时从 localStorage 读取主题偏好并设置 `.dark` class：

在现有的 `useEffect(() => { ... }, []);` 块之前添加：

```tsx
// 主题初始化
useEffect(() => {
  const saved = localStorage.getItem('pixel-bead-is-dark');
  const isDark = saved !== null ? JSON.parse(saved) : true;
  setIsDark(isDark);
  document.documentElement.classList.toggle('dark', isDark);
}, []);
```

- [ ] **Step 2: 修改 TopToolbar 的 onThemeToggle**

将:
```tsx
onThemeToggle={() => setIsDark(!isDark)}
```

改为:
```tsx
onThemeToggle={() => {
  const newIsDark = !isDark;
  setIsDark(newIsDark);
  localStorage.setItem('pixel-bead-is-dark', JSON.stringify(newIsDark));
  document.documentElement.classList.toggle('dark', newIsDark);
}}
```

注意：保持 `isDark={isDark}` 不变。

- [ ] **Step 3: 提交**

```bash
git add apps/web/src/App.tsx
git commit -m "feat: wire theme toggle with localStorage persistence"
```

---

## 任务 3: 更新 TopToolbar.tsx 颜色

**文件:**
- 修改: `apps/web/src/components/toolbar/TopToolbar.tsx:45-133`

将所有硬编码颜色替换为 CSS 变量：

| 原值 | 替换为 |
|------|--------|
| `#141416` | `var(--color-surface)` |
| `#2a2a2e` | `var(--color-border)` |
| `#e4e4e7` | `var(--color-text-primary)` |
| `#71717a` | `var(--color-text-secondary)` |

具体替换位置：
- 第 45 行: `bg-[#141416]` → `bg-[var(--color-surface)]`
- 第 49 行: `text-[#e4e4e7]` → `text-[var(--color-text-primary)]`
- 第 57 行: `text-[#e4e4e7]` → `text-[var(--color-text-primary)]`
- 第 69 行: `text-[#e4e4e7]` → `text-[var(--color-text-primary)]`
- 第 76 行: `text-[#e4e4e7]` → `text-[var(--color-text-primary)]`
- 第 90 行: `bg-[#141416]` → `bg-[var(--color-surface)]`，`text-[#e4e4e7]` → `text-[var(--color-text-primary)]`
- 第 109 行: `text-[#e4e4e7]` → `text-[var(--color-text-primary)]`
- 第 118 行: `text-text-secondary` 保持（该类名不存在于 @theme，需替换为 `text-[var(--color-text-secondary)]`）

- [ ] **Step 2: 提交**

```bash
git add apps/web/src/components/toolbar/TopToolbar.tsx
git commit -m "feat: use CSS variables for theme colors in TopToolbar"
```

---

## 任务 4: 更新 ColorPalette.tsx 颜色

**文件:**
- 修改: `apps/web/src/components/panels/ColorPalette.tsx:13-51`

替换规则：
- `#2a2a2e` → `var(--color-border)`
- `#141416` → `var(--color-surface)`
- `#1c1c1e` → `var(--color-surface)` (hover)
- `#71717a` → `var(--color-text-secondary)`
- `ring-offset-[#141416]` → `ring-offset-[var(--color-surface)]`

- [ ] **Step 1: 替换所有硬编码颜色**

逐行替换上述颜色值。

- [ ] **Step 2: 提交**

```bash
git add apps/web/src/components/panels/ColorPalette.tsx
git commit -m "feat: use CSS variables for theme colors in ColorPalette"
```

---

## 任务 5: 更新 ExportPanel.tsx 颜色

**文件:**
- 修改: `apps/web/src/components/panels/ExportPanel.tsx:29-87`

替换规则：
- `#141416` → `var(--color-surface)`
- `#2a2a2e` → `var(--color-border)`
- `#e4e4e7` → `var(--color-text-primary)`
- `#71717a` → `var(--color-text-secondary)`
- `#3a3a3e` → `var(--color-hover)`

注意：`--color-hover` 已在 index.css 中定义（浅色 #e5e5e5，深色 #3a3a3e）。

- [ ] **Step 1: 替换所有硬编码颜色**

- [ ] **Step 2: 提交**

```bash
git add apps/web/src/components/panels/ExportPanel.tsx
git commit -m "feat: use CSS variables for theme colors in ExportPanel"
```

---

## 任务 6: 更新 SelectionPanel.tsx 颜色

**文件:**
- 修改: `apps/web/src/components/panels/SelectionPanel.tsx:23-66`

替换规则：
- `#141416` → `var(--color-surface)`
- `#2a2a2e` → `var(--color-border)`
- `#e4e4e7` → `var(--color-text-primary)`
- `#71717a` → `var(--color-text-secondary)`
- `#27272a` → `var(--color-hover)`
- `#3f3f5a` → `var(--color-hover-border)`

- [ ] **Step 1: 替换所有硬编码颜色**

- [ ] **Step 2: 提交**

```bash
git add apps/web/src/components/panels/SelectionPanel.tsx
git commit -m "feat: use CSS variables for theme colors in SelectionPanel"
```

---

## 任务 7: 更新 FramePanel.tsx 颜色

**文件:**
- 修改: `apps/web/src/components/panels/FramePanel.tsx:84-143`

替换规则：
- `#141416` → `var(--color-surface)`
- `#2a2a2e` → `var(--color-border)`
- `#e4e4e7` → `var(--color-text-primary)`
- `#71717a` → `var(--color-text-secondary)`

- [ ] **Step 1: 替换所有硬编码颜色**

- [ ] **Step 2: 提交**

```bash
git add apps/web/src/components/panels/FramePanel.tsx
git commit -m "feat: use CSS variables for theme colors in FramePanel"
```

---

## 任务 8: 验证并测试

- [ ] **Step 1: 启动开发服务器**

```bash
cd apps/web && pnpm dev
```

- [ ] **Step 2: 验证深色模式**

确认默认（刷新后）显示深色主题，页面背景为 #0a0a0b。

- [ ] **Step 3: 验证浅色模式切换**

点击工具栏的 ☀️/🌙 按钮，确认 UI 变为浅色（背景 #fafafa）。

- [ ] **Step 4: 验证持久化**

刷新页面，确认主题偏好保持不变。

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat: complete dark/light theme switching"
```
