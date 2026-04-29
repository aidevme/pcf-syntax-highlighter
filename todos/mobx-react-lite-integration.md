# MobX + mobx-react-lite Integration Plan
## PCF Syntax Highlighter Control

**Date:** April 29, 2026  
**Package:** [mobx-react-lite v4.1.1](https://www.npmjs.com/package/mobx-react-lite)  
**MobX peer dep:** mobx v6  

---

## 1. Executive Summary

`mobx-react-lite` is a lightweight React binding (~1.5 kB gzipped) for MobX that enables reactive state management in functional components. It replaces scattered `React.useState` hooks with a single observable store object, giving fine-grained, automatic re-rendering with zero boilerplate selectors or manual dependency arrays.

For this control the main motivation would be:

- Centralise the 10+ `React.useState` calls in `SyntaxHighlighter.tsx` into a single observable `SyntaxHighlighterStore`.
- Eliminate prop-drilling of state callbacks down to `SettingsDrawer` and `SyntaxHighlighterEditor`.
- Make `PcfContextService` observable so PCF `updateView` changes propagate automatically.

---

## 2. Current Architecture

```
index.ts  (PCF lifecycle)
  └─ SyntaxHighlighterApp.tsx  (creates PcfContextService, renders FluentProvider)
       └─ SyntaxHighlighterControl  (SyntaxHighlighter.tsx)
            ├─ 10x useState hooks  (value, language, theme, showLineNumbers, …)
            ├─ 4x useEffect hooks  (fieldValue sync, language, theme, highlighting)
            ├─ SyntaxHighlighterEditor.tsx  (receives highlightedHtml + code as props)
            └─ SettingsDrawer.tsx   (receives 7 booleans/strings + 7 callbacks as props)
```

### State that would move into MobX

| Current useState | Proposed observable field |
|---|---|
| `value` | `store.code` |
| `language` | `store.language` |
| `theme` | `store.theme` |
| `showLineNumbers` | `store.showLineNumbers` |
| `showCopyButton` | `store.showCopyButton` |
| `lineHighlights` | `store.lineHighlights` |
| `lineHighlightsOnHover` | `store.lineHighlightsOnHover` |
| `lineBlurring` | `store.lineBlurring` |
| `backgroundColor` | `store.backgroundColor` |
| `foregroundColor` | `store.foregroundColor` |
| `highlightedHtml` | `store.highlightedHtml` (async action) |
| `isDrawerOpen` | `store.isDrawerOpen` |

---

## 3. Implementation Steps

### Step 1 — Install dependencies

```bash
cd src/SyntaxHighlighter
npm install mobx mobx-react-lite
```

> **Note:** `mobx-react-lite` v4 requires mobx v6 and React 16.8+. The control uses React 16.14.0 — compatible.

---

### Step 2 — Create the observable store

Create `src/SyntaxHighlighter/SyntaxHighlighter/stores/SyntaxHighlighterStore.ts`:

```ts
import { makeAutoObservable, runInAction } from 'mobx';
import {
  createHighlighter,
  bundledThemes,
  type Highlighter,
  type BundledLanguage,
  type BundledTheme,
} from 'shiki';
import { getEditorLanguage } from '../utils/languages';

// Module-level shared highlighter (preserves existing architecture)
let highlighterInstance: Highlighter | null = null;
const highlighterPromise = createHighlighter({ themes: [], langs: [] }).then((h) => {
  highlighterInstance = h;
  return h;
});

export class SyntaxHighlighterStore {
  // --- Observable state ---
  code = '';
  language = 'markdown';
  theme = 'dark-plus';
  showLineNumbers = true;
  showCopyButton = true;
  lineHighlights = false;
  lineHighlightsOnHover = false;
  lineBlurring = false;
  backgroundColor = '#ffffff';
  foregroundColor = '#000000';
  highlightedHtml = '';
  isDrawerOpen = false;

  constructor(initialLanguage = 'markdown', initialTheme = 'dark-plus') {
    this.language = initialLanguage;
    this.theme = initialTheme;
    makeAutoObservable(this);
  }

  // --- Actions ---
  setCode(raw: string) {
    let processed = raw.includes('\\n') && !raw.includes('\n')
      ? raw.replace(/\\n/g, '\n')
      : raw;

    if (this.language === 'json' && processed.trim()) {
      try {
        processed = JSON.stringify(JSON.parse(processed), null, 2);
      } catch { /* keep as-is */ }
    }
    this.code = processed;
  }

  setLanguage(lang: string) { this.language = lang; }
  setTheme(theme: string) { this.theme = theme; }
  setShowLineNumbers(v: boolean) { this.showLineNumbers = v; }
  setShowCopyButton(v: boolean) { this.showCopyButton = v; }
  setLineHighlights(v: boolean) { this.lineHighlights = v; }
  setLineHighlightsOnHover(v: boolean) { this.lineHighlightsOnHover = v; }
  setLineBlurring(v: boolean) { this.lineBlurring = v; }
  openDrawer() { this.isDrawerOpen = true; }
  closeDrawer() { this.isDrawerOpen = false; }

  async loadThemeColors() {
    try {
      const mod = await bundledThemes[this.theme as keyof typeof bundledThemes]?.();
      if (!mod) return;
      const themeData = 'default' in mod ? mod.default : mod;
      const colors = (themeData as { colors?: Record<string, string> }).colors;
      runInAction(() => {
        this.backgroundColor = colors?.['editor.background'] ?? '#ffffff';
        this.foregroundColor = colors?.['editor.foreground'] ?? '#000000';
      });
    } catch {
      runInAction(() => {
        this.backgroundColor = '#ffffff';
        this.foregroundColor = '#000000';
      });
    }
  }

  async generateHighlightedHtml() {
    try {
      const highlighter = await highlighterPromise;
      if (!this.code) {
        runInAction(() => { this.highlightedHtml = ''; });
        return;
      }
      const editorLang = getEditorLanguage(this.language);
      if (!highlighter.getLoadedLanguages().includes(editorLang)) {
        await highlighter.loadLanguage(editorLang as BundledLanguage);
      }
      if (!highlighter.getLoadedThemes().includes(this.theme)) {
        await highlighter.loadTheme(this.theme as BundledTheme);
      }
      const html = highlighter.codeToHtml(this.code, { lang: editorLang, theme: this.theme });
      runInAction(() => { this.highlightedHtml = html; });
    } catch {
      runInAction(() => {
        this.highlightedHtml = `<pre style="background:${this.backgroundColor};color:${this.foregroundColor};padding:16px;border-radius:4px;overflow-x:auto"><code>${this.code}</code></pre>`;
      });
    }
  }
}
```

> Key points:
> - `makeAutoObservable` infers observable/action/computed automatically — no decorators required.
> - Async side effects use `runInAction` to batch state updates outside the action scope (MobX strict-mode safe).
> - Module-level `highlighterPromise` is preserved exactly as before.

---

### Step 3 — Create a React context for the store

Create `src/SyntaxHighlighter/SyntaxHighlighter/stores/SyntaxHighlighterStoreContext.tsx`:

```tsx
import * as React from 'react';
import { SyntaxHighlighterStore } from './SyntaxHighlighterStore';

const StoreContext = React.createContext<SyntaxHighlighterStore>(undefined!);

export const SyntaxHighlighterStoreProvider: React.FC<{
  store: SyntaxHighlighterStore;
  children: React.ReactNode;
}> = ({ store, children }) => (
  <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
);

export const useSyntaxHighlighterStore = () => React.useContext(StoreContext);
```

---

### Step 4 — Instantiate the store in SyntaxHighlighterApp

Update `SyntaxHighlighterApp.tsx`:

```tsx
import { SyntaxHighlighterStore } from './stores/SyntaxHighlighterStore';
import { SyntaxHighlighterStoreProvider } from './stores/SyntaxHighlighterStoreContext';

export class SyntaxHighlighterApp extends React.Component<ISyntaxHighlighterAppProps> {
  private store: SyntaxHighlighterStore;

  constructor(props: ISyntaxHighlighterAppProps) {
    super(props);
    const pcfContextService = new PcfContextService({ ... });
    this.store = new SyntaxHighlighterStore(
      pcfContextService.getDefaultLanguage(),
      pcfContextService.getDefaultTheme()
    );
  }

  public render() {
    // On each updateView, sync PCF field value into the store
    const fieldValue = this.props.context.parameters.syntaxHiglightedField?.raw ?? '';
    this.store.setCode(fieldValue);

    return (
      <SyntaxHighlighterStoreProvider store={this.store}>
        <PcfContextProvider pcfcontext={pcfContextService}>
          <FluentProvider theme={webLightTheme}>
            <IdPrefixProvider value={`app-${this.props.instanceid}-`}>
              <SyntaxHighlighterControl />
            </IdPrefixProvider>
          </FluentProvider>
        </PcfContextProvider>
      </SyntaxHighlighterStoreProvider>
    );
  }
}
```

---

### Step 5 — Refactor SyntaxHighlighter.tsx with observer

```tsx
import { observer } from 'mobx-react-lite';
import { reaction } from 'mobx';
import { useSyntaxHighlighterStore } from '../stores/SyntaxHighlighterStoreContext';

export const SyntaxHighlighterControl = observer(() => {
  const store = useSyntaxHighlighterStore();
  const pcfContext = usePcfContext();
  const isReadOnly = !pcfContext.canReadField();

  // Re-generate highlighted HTML whenever code/language/theme changes
  React.useEffect(() => {
    return reaction(
      () => [store.code, store.language, store.theme],
      () => { void store.generateHighlightedHtml(); },
      { fireImmediately: true }
    );
  }, [store]);

  // Reload theme colors when theme changes
  React.useEffect(() => {
    return reaction(
      () => store.theme,
      () => { void store.loadThemeColors(); },
      { fireImmediately: true }
    );
  }, [store]);

  if (isReadOnly) return <div>You do not have permission to view this field</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Tooltip content="Open settings" relationship="label" withArrow>
          <Badge onClick={store.openDrawer} ...>{store.language}</Badge>
        </Tooltip>
        <div className={styles.buttonGroup}>
          {!isReadOnly && (
            <Button icon={<Settings24Regular />} onClick={store.openDrawer} size="small" />
          )}
          {store.showCopyButton && (
            <Button icon={<Copy24Regular />} onClick={() => void navigator.clipboard.writeText(store.code)} size="small" />
          )}
        </div>
      </div>
      <SyntaxHighlighterEditor />
      <SettingsDrawer />
    </div>
  );
});
```

> The component no longer receives any props — it reads directly from the store.

---

### Step 6 — Refactor SyntaxHighlighterEditor.tsx with observer

```tsx
import { observer } from 'mobx-react-lite';
import { useSyntaxHighlighterStore } from '../../stores/SyntaxHighlighterStoreContext';

export const SyntaxHighlighterEditor = observer(() => {
  const store = useSyntaxHighlighterStore();
  const [selectedTab, setSelectedTab] = React.useState('read');
  // ... rest unchanged, just read from store instead of props
});
```

The `ISyntaxHighlighterEditorProps` interface and `highlightedHtml`/`code` props can be removed entirely.

---

### Step 7 — Refactor SettingsDrawer.tsx with observer

```tsx
import { observer } from 'mobx-react-lite';
import { useSyntaxHighlighterStore } from '../../stores/SyntaxHighlighterStoreContext';

export const SettingsDrawer = observer(() => {
  const store = useSyntaxHighlighterStore();
  // Local pending state pattern is still valid here for Apply/Cancel UX.
  // Local useState for pending values; on Apply -> store.setLanguage(localLanguage) etc.
  // isOpen -> store.isDrawerOpen; onClose -> store.closeDrawer()
});
```

The entire `ISettingsDrawerProps` interface (7 booleans + 7 callbacks) can be removed.

---

### Step 8 — Remove unused props interfaces

After the refactor, the following can be removed or simplified:

- `ISyntaxHighlighterControlProps.onChange` (was unused)
- `ISyntaxHighlighterEditorProps` (was `{ highlightedHtml, code }`)
- `ISettingsDrawerProps` (was 14 props)

---

## 4. File Change Summary

| File | Change |
|---|---|
| `package.json` | Add `mobx`, `mobx-react-lite` to dependencies |
| `stores/SyntaxHighlighterStore.ts` | **New** — observable store class |
| `stores/SyntaxHighlighterStoreContext.tsx` | **New** — React context + hook |
| `SyntaxHighlighterApp.tsx` | Instantiate store, wrap tree with provider |
| `components/SyntaxHighlighter.tsx` | Wrap with `observer`, remove useState/useEffect, read from store |
| `components/editor/SyntaxHighlighterEditor.tsx` | Wrap with `observer`, remove props |
| `components/drawers/SettingsDrawer.tsx` | Wrap with `observer`, remove props/callbacks |

---

## 5. Risk Analysis

### 5.1 React version constraint
| Risk | Severity | Notes |
|---|---|---|
| `mobx-react-lite` v4 requires React ≥ 16.8 | **Low** | Control uses React 16.14.0 — satisfied. |
| PCF platform pins React 16.14.0 via `platform-library` in manifest | **Low** | MobX does not depend on React internals beyond the hooks API. |

### 5.2 Bundle size impact
| Risk | Severity | Notes |
|---|---|---|
| `mobx` adds ~16 kB gzipped; `mobx-react-lite` adds ~1.5 kB | **Medium** | Bundle is already 14 MB due to Shiki + Fluent UI icons. Relative increase is negligible. |

### 5.3 PCF updateView re-render cycle
| Risk | Severity | Notes |
|---|---|---|
| PCF calls `updateView` on every property change, which re-creates `React.createElement(SyntaxHighlighterApp)` | **Medium** | `SyntaxHighlighterApp` is a class component; the store must be stored as an instance field (not recreated on each render) to preserve observable state across PCF update cycles. See Step 4. |
| Calling `store.setCode(fieldValue)` inside `render()` is a MobX action called outside action scope | **Medium** | Wrap with `runInAction` or annotate the call site; React class component `render` is not a MobX action by default. |

### 5.4 Async actions and React StrictMode
| Risk | Severity | Notes |
|---|---|---|
| React StrictMode double-invokes effects; `reaction` cleanup must be returned | **Low** | All `reaction` calls in Step 5 return their disposer — correct pattern. |
| `generateHighlightedHtml` is async; MobX state mutations after `await` must use `runInAction` | **Medium** | Already handled in the store implementation above. Forgetting this in future changes will cause MobX warnings. |

### 5.5 MobX strict mode (enforce actions)
| Risk | Severity | Notes |
|---|---|---|
| MobX v6 defaults to `"observed"` enforceActions mode, not strict | **Low** | For safer code, configure `configure({ enforceActions: 'always' })` at app entry. This will surface accidental direct mutations early. |

### 5.6 SettingsDrawer local pending state pattern
| Risk | Severity | Notes |
|---|---|---|
| The drawer uses local React state for pending Apply/Cancel UX — mixing React state with MobX store is intentional and valid | **Low** | Only the final Apply action writes to the store. This hybrid is the recommended pattern for forms with a commit step. |

### 5.7 `mobx-react-lite` and non-observer children
| Risk | Severity | Notes |
|---|---|---|
| If observable objects are passed as props to non-observer components (e.g. Fluent UI internals), changes won't propagate | **Low** | All consuming components (`SyntaxHighlighterEditor`, `SettingsDrawer`) will be wrapped with `observer`. Fluent UI components only receive primitives. |

### 5.8 Memory leaks from reaction disposers
| Risk | Severity | Notes |
|---|---|---|
| Reactions created with `reaction()` must be disposed when the component unmounts | **Medium** | The `useEffect` return value pattern (returning the disposer function) handles this correctly, as shown in Step 5. |

### 5.9 PCF deployment / build toolchain
| Risk | Severity | Notes |
|---|---|---|
| `pcf-scripts` uses Webpack 5 internally; MobX uses ES modules | **Low** | MobX v6 ships both CJS and ESM. Webpack 5 handles both. No additional configuration needed. |
| Babel may need `@babel/plugin-proposal-class-properties` for decorator syntax | **None** | We are NOT using decorators — `makeAutoObservable` is the decorator-free API. Zero Babel config changes needed. |

---

## 6. Testing Considerations

Since the project has no automated test suite, the following manual verification steps are recommended after migration:

1. **PCF test harness** (`npm start watch`): Verify the highlighted code updates when the bound field value changes.
2. **Language/theme change**: Open SettingsDrawer → change language → Apply → confirm re-highlight.
3. **PCF updateView cycle**: In the test harness, change a property multiple times in quick succession — confirm no duplicate renders or stale state.
4. **Drawer Apply/Cancel**: Open drawer → change settings → Cancel → confirm original values are preserved.
5. **isReadOnly flag**: Simulate a read-only field security scenario — confirm Settings button is hidden.

---

## 7. Migration Strategy (Incremental Approach)

Rather than migrating everything at once, the following phased approach minimises risk:

### Phase 1 — Store scaffold only
- Install `mobx` + `mobx-react-lite`
- Create `SyntaxHighlighterStore` and context
- Instantiate in `SyntaxHighlighterApp`, pass store as prop to `SyntaxHighlighterControl`
- No component changes yet — verify build succeeds

### Phase 2 — Migrate SyntaxHighlighter.tsx
- Replace all `useState` / `useEffect` with store reads + MobX `reaction`
- Verify the main component works end-to-end

### Phase 3 — Migrate SettingsDrawer.tsx
- Remove props interface, read from store directly
- Verify Apply / Cancel UX

### Phase 4 — Migrate SyntaxHighlighterEditor.tsx
- Remove props interface, read from store directly
- Clean up unused interfaces

---

## 8. Decision: Should We Adopt MobX?

### Arguments FOR
- Eliminates 10+ `useState` hooks and 4+ `useEffect` chains in a single component
- Removes 14 prop-drilling entries to `SettingsDrawer`
- Computed values (e.g. `get formattedCode()`) become trivial to add
- Fine-grained reactivity — only the exact components reading a changed observable re-render
- `reaction` is more explicit than `useEffect` dependency arrays for side effects

### Arguments AGAINST
- Adds two new dependencies (`mobx` + `mobx-react-lite`) to a control that currently has zero state-management libraries
- The current component is large but not broken — this is a refactor, not a bug fix
- PCF controls are typically short-lived per page load; the performance gains of MobX are marginal for this use case
- Team must learn MobX patterns (actions, reactions, runInAction) alongside PCF and Fluent UI

### Recommendation
Adopt MobX **if** the control is expected to grow significantly (more settings, more state, more components). For the current scope, the `useState` approach is adequate. If additional features like live editing, undo/redo, or multi-panel state sharing are planned, the MobX migration would pay off quickly.

---

## 9. Quick Reference

```bash
# Install
npm install mobx mobx-react-lite

# Key imports
import { makeAutoObservable, runInAction, reaction } from 'mobx';
import { observer } from 'mobx-react-lite';
```

| Concept | Usage |
|---|---|
| `makeAutoObservable(this)` | Makes all class fields observable, methods actions, getters computed |
| `observer(Component)` | Makes a functional component subscribe to observables automatically |
| `runInAction(() => {...})` | Batches mutations after async awaits |
| `reaction(() => obs, effect)` | Runs a side-effect when a specific observable changes; returns disposer |
| `useLocalObservable(() => ({...}))` | Creates a local observable object inside a component |
