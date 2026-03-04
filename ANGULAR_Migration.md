# Angular Migration Guide

This document describes how to migrate this project across Angular major versions in a **safe, repeatable** way.

It’s intentionally practical:

- what to change
- what to run
- how to verify
- how to troubleshoot the usual breakages (Material, signals, builders, ESLint, OpenAPI, etc.)

---

## Current Baseline

- **Angular**: 19.x (standalone components, `@angular/build` builder)
- **Styling**: SCSS
- **UI**: Angular Material (MDC)
- **i18n**: `@ngx-translate/core`
- **API client**: OpenAPI-generated Angular client in `openapi/generated`
- **Mock backend**: `mocks/server.js` (Connect middleware + JSON DB)
- **Auth**: Fake JWT login (mock server) + FE AuthStore

---

## Migration Principles

### 1) One major at a time

Avoid jumping multiple major versions in one go unless you absolutely must.

### 2) Keep changes mechanical

Prefer automated migrations (`ng update`) and minimal manual edits.

### 3) Always keep the app runnable

After each major step:

- app builds
- app serves
- critical flows work (Books list, Overview, Create/Edit/Delete, Login)

### 4) Lock and document versions

Commit `package-lock.json` / `pnpm-lock.yaml` / `yarn.lock` consistently and tag the repo after each major upgrade.

---

## Pre-flight Checklist

Before you start:

- Clean working tree: `git status` must be clean
- Node version is compatible with the **target Angular** version
- Update global tooling **only if needed**
- Ensure tests and lint pass on the current version

Recommended commands:

```bash
npm ci
npm run lint
npm run test
npm run build
npm run start:mock
```

---

## Project-Specific Notes

### Builders and configuration

This project uses the **modern CLI builder**:

- `@angular/build:application`
- `@angular/build:dev-server`

If a migration suggests switching back to older builders, avoid that.

### Standalone architecture

Most UI is **standalone**, so migrations that assume NgModules may require small adjustments.

### OpenAPI generated client

OpenAPI code generation can break typings after upgrades. Treat it as an **external artifact**:

- regenerate
- compile
- fix usage in a controlled way

---

## Step-by-step Migration Process

### Block A — Prepare a migration branch

```bash
git checkout -b chore/migrate-angular-<target>
```

Optional, but recommended:

```bash
git tag baseline/angular-<current>
```

---

### Block B — Update Angular core + CLI

Use Angular’s official update tooling:

```bash
npx ng update @angular/core@<target> @angular/cli@<target>
```

If the CLI prompts:

- accept migrations
- prefer default choices unless you have a strong reason

Then:

```bash
npm install
```

---

### Block C — Update TypeScript + RxJS alignment

Angular often requires a specific TS range.

```bash
npx ng version
```

If build errors mention TS incompatibility, update TypeScript to the supported range:

```bash
npm i -D typescript@<supported>
```

RxJS is usually handled automatically, but if not:

```bash
npm i rxjs@<supported>
```

---

### Block D — Update Angular Material (if used)

Material often breaks on majors.

```bash
npx ng update @angular/material@<target>
```

Then verify:

- dialogs
- toolbar
- form fields
- buttons
- typography and theme overrides

**Common breakage**: MDC class names / DOM structure changes.  
Fix by updating `::ng-deep` selectors in SCSS if needed.

---

### Block E — Update ESLint + build tooling

If ESLint rules/plugins break after upgrade:

- update `@angular-eslint/*`
- update `eslint` + `typescript-eslint`

Typical:

```bash
npm i -D eslint@latest @angular-eslint/builder@latest @angular-eslint/eslint-plugin@latest @angular-eslint/eslint-plugin-template@latest @angular-eslint/template-parser@latest
```

If Stylelint breaks, update stylelint config versions together.

---

### Block F — Regenerate OpenAPI client

If OpenAPI types break after upgrading Angular/TS, regenerate.

#### 1) Update `openapi.yaml` (if needed)

Then regenerate using your project script (check `package.json`), commonly one of:

```bash
npm run openapi:generate
# or
npm run generate:openapi
```

If you don’t have a script yet, typical OpenAPI generator command looks like:

```bash
npx openapi-generator-cli generate \\
  -i openapi.yaml \\
  -g typescript-angular \\
  -o openapi/generated
```

#### 2) Verify compilation

```bash
npm run build
```

---

## Validation Checklist After Each Major Upgrade

### Smoke tests

- `/` (Overview) loads books and infinite scroll works
- `/list` loads books (single request, no duplicates)
- Create book works and refreshes list
- Edit book works
- Delete book works
- Login works and token persists
- Logout clears session

### Technical checks

- `npm run build`
- `npm run lint`
- `npm run test` (if tests exist)
- No runtime console errors

---

## Common Issues & Fixes

### Issue: duplicate initial GET requests

Usually caused by:

- calling `loadBooks()` in multiple components **and**
- store effects that auto-fetch on init

Fix approach:

- make the store own the initial fetch (`init()` once)
- components call `store.init()` (idempotent)
- do not call `loadBooksRequest()` directly from multiple places

### Issue: NG0203 (inject outside injection context)

This happens when calling `inject()` in:

- non-constructor top-level code
- callbacks not executed inside Angular DI context

Fix:

- only use `inject()` in constructors, field initializers, or inside Angular `effect()`
- for helpers, pass dependencies as params instead of injecting

### Issue: Material inputs turn purple

This is theme palette / accent default leaking.
Fix:

- override MDC tokens / CSS variables in your global theme
- or apply component SCSS overrides similar to the Books List styles

### Issue: 204 DELETE treated as failure

Some generated OpenAPI clients try to parse JSON on empty body.
Fix:

- server returns `200` with JSON body, or
- OpenAPI spec declares correct response content type
- or set `observe: 'response'` + responseType `'text'` in client call

### Issue: Standalone templates using `*ngIf` warnings

If you use `*ngIf` you must import `CommonModule` **or** switch to `@if`.

For standalone components:

- add `CommonModule` to `imports`
- or refactor to `@if (...) { ... }`

---

## Recommended Branch/Commit Strategy

For each major upgrade:

1. commit dependency changes
2. commit migration output changes
3. commit fixes (Material, ESLint, OpenAPI)
4. tag the working state

Example:

```bash
git commit -m "chore: upgrade angular to <target>"
git commit -m "chore: apply angular migrations"
git commit -m "fix: material + openapi typings"
git tag angular-<target>-stable
```

---

## What to do if the upgrade gets messy

If you end up in dependency conflicts:

- revert to the last stable tag
- upgrade one subsystem at a time:
  - Angular core/cli
  - Material
  - ESLint
  - OpenAPI generator + regenerated client

---

## Appendix: Useful Commands

```bash
# show versions
npx ng version

# clear and reinstall
rm -rf node_modules package-lock.json
npm install

# build + serve
npm run build
npm run start

# mock server
npm run start:mock

# openapi regenerate (if script exists)
npm run openapi:generate
```
