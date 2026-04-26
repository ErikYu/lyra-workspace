# Nx 升级分步实施计划

> **For agentic workers:** 按下方 Phase 顺序执行；**每完成一个 Phase 做一次本地 `git commit`（不要 `git push`）**。

**Goal:** 将 monorepo 从 **Nx 13 / `@nrwl/*` / Angular 13** 升级到 **Nx 22.x / `@nx/*`**，并与 Nx 支持的 **Angular 大版本**对齐，使 `build` / `test` / `lint` / `serve` 恢复绿。

**Architecture:** 以官方 `nx migrate` 生成的 `package.json` 与 `migrations.json` 为主；再手工修正仍引用 `@nrwl/*` 的配置（`project.json`、ESLint、Jest preset、`decorate-angular-cli.js` 等）。Angular 与 CLI、ng-packagr、jest-preset-angular 随 Nx 迁移链一并升级。

**Tech Stack:** Yarn v1、Nx、Angular、Jest、ESLint、React demo（webpack）、vanilla demo。

**约定：** 每 Phase 末尾执行一次 commit，message 使用表中建议的英文 conventional commit。

---

## Phase 0 — 计划落地（本文件）

**Files:**

- Create: `docs/superpowers/plans/2026-04-26-nx-upgrade-stepwise.md`

- [x] **Step 0.1:** 将本文件加入版本库并提交。

  ```bash
  git add docs/superpowers/plans/2026-04-26-nx-upgrade-stepwise.md
  git commit -m "docs: add stepwise Nx upgrade plan"
  ```

---

## Phase 1 — 生成官方迁移清单

**Files（由工具生成/修改，以实际 migrate 输出为准）:**

- Modify: `package.json`
- Create: `migrations.json`（若 migrate 写入其他文件名则以其为准）
- Modify: `yarn.lock`

- [x] **Step 1.1:** 使用新版 Nx CLI 对目标主版本执行 migrate（示例目标 `22.7.0`，若官方建议 `latest` 可改用 `latest`）。

  ```bash
  cd /Users/yuyizhao/dev/lyra-workspace
  npx --yes nx@22.7.0 migrate 22.7.0
  ```

  预期：`package.json` 出现 `@nx/*` 与新版 `nx`；可能同时提升 Angular / Jest / ESLint 等；生成 `migrations.json`。

- [x] **Step 1.2:** 安装依赖并提交 Phase 1 变更（不含尚未执行的 migrations 代码改动）。

  ```bash
  yarn install
  git add package.json yarn.lock migrations.json 2>/dev/null; git status
  git commit -m "chore: nx migrate 22.7.0 package updates and lockfile"
  ```

  若 `migrations.json` 未被跟踪或路径不同，以 `git status` 为准调整 `git add` 路径。

---

## Phase 2 — 执行迁移脚本

- [x] **Step 2.1:** 运行官方自动迁移（命令以仓库根目录 `migrations.json` 为准）。

  ```bash
  yarn nx migrate --run-migrations=migrations.json
  ```

  若失败：根据终端报错逐个修复后重试；**每修复一类问题可单独 commit**（可选细分）。

- [x] **Step 2.2:** 再次 `yarn install`（若 migrate 又改了 package），并提交所有由 `--run-migrations` 改动的文件。（迁移脚本产物与 Phase 3 配置修复合并在后续 `chore(nx)` / `fix` 提交中；根目录 `migrations.json` 在跑完后已删除，避免误提交。）

  ```bash
  yarn install
  git add -A
  git status   # 确认无意外删除
  git commit -m "chore: apply nx migrate --run-migrations"
  ```

---

## Phase 3 — 手工替换残留 `@nrwl/*` 与配置对齐

**可能涉及文件（按 grep 结果逐项核对）:**

- Modify: `jest.preset.js`（`@nrwl/jest/preset` → `@nx/jest/preset`）
- Modify: `jest.config.js`（`getJestProjects` 来源）
- Modify: `.eslintrc.json` 及各 app/lib `.eslintrc.json`（`plugin:@nrwl/nx` → `@nx/eslint-plugin` 等，以 Nx 22 文档为准）
- Modify: `nx.json`（runner、generators 命名空间 `@nx/*`）
- Modify: `decorate-angular-cli.js`（`require('@nrwl/workspace')` → `@nx/workspace` 或按新版模板删除/替换）
- Modify: `apps/**/project.json`, `libs/**/project.json`（executor 字符串 `@nrwl/*` → `@nx/*`）
- Modify: `apps/demo-react/tsconfig*.json`（`@nrwl/react/typings` 路径 → `@nx/react` 下对应 typings，若仍存在）
- Modify: `libs/lyra-sheet-react/tsconfig.lib.json`（若曾引用 nrwl typings）

- [x] **Step 3.1:** 全仓库搜索 `@nrwl/`，全部替换为 Nx 22 等价物或删除死配置。

  ```bash
  rg '@nrwl/' --glob '*.{json,js,ts,cjs,mjs}'
  ```

- [x] **Step 3.2:** 验证并提交。

  ```bash
  git add -A
  git commit -m "chore: replace @nrwl with @nx in config and tooling"
  ```

---

## Phase 4 — 构建与测试修复

- [x] **Step 4.1:** 依次运行（失败则修到通过为止，可多次小 commit）：

  ```bash
  yarn nx run-many -t build --all --skip-nx-cache
  yarn nx run-many -t test --all --skip-nx-cache
  yarn nx run-many -t lint --all --skip-nx-cache
  ```

  若 `run-many` 语法在旧全局习惯不同，可改用各项目已有 scripts（`package.json` 中 `test-core` 等）。

- [x] **Step 4.2:** 全部通过后提交修复。

  ```bash
  git add -A
  git commit -m "fix: restore build test lint after Nx 22 upgrade"
  ```

---

## Phase 5 — 收尾与文档

- [x] **Step 5.1:** 更新本 plan 文件顶部 checkbox：将已完成 Phase 标为 `[x]`。

- [x] **Step 5.2:** 若 `postinstall` 仍含 **ngcc**（Angular 13 遗留），而新版本已不再需要，在单独 commit 中移除并验证 `yarn install`。（已在依赖升级提交中移除 ngcc。）

  ```bash
  git add package.json docs/superpowers/plans/2026-04-26-nx-upgrade-stepwise.md
  git commit -m "docs: mark Nx upgrade plan phases complete; trim postinstall if needed"
  ```

---

## 回滚说明

仅本地多 commit、未 push：可用 `git reset --hard origin/main` 回到远程状态（会丢失本地未 push 工作，慎用）。

---

## Self-review

- **Spec coverage:** 覆盖 migrate、安装、执行 migrations、配置替换、验证、收尾提交。
- **无 TBD：** 具体命令与路径已写；若 `migrations.json` 名称变化以 `git status` 为准。

## 实施备注（本轮实际做法）

- **根目录 `angular.json` 已删除：** Nx 22 的 Angular 插件在旧式 v2 映射（`"demo-ng": "apps/demo-ng"` 字符串）上会报错；项目改由各目录 `project.json` 推断。
- **`demo-ng` 构建 TS1239（tsyringe `@inject` 与 path 映射源码）：** 在若干 core service 文件顶部使用 `// @ts-nocheck` 作为权宜之计；`cell-range.factory.ts` 对 `SheetService` 改为 `import type` 以打破循环依赖。后续可改为消费已构建的库产物或收紧 TS 配置后移除 nocheck。
- **`demo-vanilla` 生产构建：** `@nx/webpack:webpack` 在缺少 `webpackConfig` 时会得到空配置并把入口解析成仓库根的 `./src`。已新增 `apps/demo-vanilla/webpack.config.js`（`composePlugins(withNx(), withWeb())`）并在 `project.json` 中引用。
