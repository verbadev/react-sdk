# @verbadev/react

Official React SDK for [Verba](https://verba.dev) - Translation Management System.

## Installation

```bash
npm install @verbadev/react @verbadev/js
```

## Quick Start

```tsx
import { VerbaProvider, useVerba } from '@verbadev/react'

function App() {
  return (
    <VerbaProvider
      projectId="your-project-id"
      publicKey="pk_your-public-key"
    >
      <MyComponent />
    </VerbaProvider>
  )
}

function MyComponent() {
  const { t, isReady } = useVerba()

  if (!isReady) return <p>Loading...</p>

  return <h1>{t('welcome.message', 'Welcome!')}</h1>
}
```

## Configuration

### `<VerbaProvider>`

Wrap your app with `VerbaProvider` to provide translation context to all child components.

```tsx
<VerbaProvider
  projectId={string}    // Required - Your project ID from the dashboard
  publicKey={string}    // Required - Your public key (safe for client-side)
  locale={string}       // Optional - defaults to auto-detection from browser
  baseUrl={string}      // Optional - API base URL (default: 'https://verba.dev')
>
  {children}
</VerbaProvider>
```

## Locale Auto-Detection

By default, the SDK automatically detects the user's locale from the browser (`navigator.language`) and matches it against your project's available locales.

```tsx
// Auto-detect (default behavior)
<VerbaProvider projectId={projectId} publicKey={publicKey}>

// Override with specific locale
<VerbaProvider projectId={projectId} publicKey={publicKey} locale="es">
```

**Matching logic:**
1. Exact match (e.g., `en-US` → `en-US`)
2. Base language match (e.g., `en-US` → `en`)
3. Falls back to project's default locale if no match

## API Reference

### `useVerba()`

Access translations and locale management from any component inside `VerbaProvider`.

```tsx
const { t, locale, setLocale, locales, defaultLocale, isReady } = useVerba()
```

**Returns:**

| Property | Type | Description |
|---|---|---|
| `t` | `(key, defaultValue?, params?) => string` | Get a translated string |
| `locale` | `string` | Current active locale |
| `setLocale` | `(locale: string) => void` | Change locale (triggers re-render) |
| `locales` | `string[]` | All available locales |
| `defaultLocale` | `string \| null` | Project's default locale |
| `isReady` | `boolean` | Whether translations have loaded |

### `t(key, defaultValue?, params?)`

Get a translation for the current locale with optional interpolation.

```tsx
function MyComponent() {
  const { t } = useVerba()

  return (
    <div>
      {/* Basic usage */}
      <h1>{t('welcome.message')}</h1>

      {/* With default value (auto-creates missing keys) */}
      <p>{t('greeting', 'Hello!')}</p>

      {/* With interpolation params */}
      <p>{t('greeting', { name: 'Łukasz' })}</p>
      {/* 'Hello, {name}!' → 'Hello, Łukasz!' */}

      {/* With both default value and params */}
      <p>{t('greeting', 'Hello, {name}!', { name: 'Łukasz' })}</p>
    </div>
  )
}
```

**Flexible signature:**
- `t(key)` - just the key
- `t(key, defaultValue)` - with fallback string
- `t(key, params)` - with interpolation params (object)
- `t(key, defaultValue, params)` - with both

**Auto-creation:** When you call `t()` with a `defaultValue` and the key doesn't exist, the SDK automatically:
1. Returns the `defaultValue` immediately
2. Creates the key in Verba in the background
3. Triggers AI translation to all your project's locales

This enables a powerful workflow where you can write code first and translations are created on-the-fly.

### `setLocale(locale)`

Change the active locale. Triggers a re-render of all components using `useVerba()`.

```tsx
function LocaleSwitcher() {
  const { locale, setLocale, locales } = useVerba()

  return (
    <select value={locale} onChange={(e) => setLocale(e.target.value)}>
      {locales.map((l) => (
        <option key={l} value={l}>{l}</option>
      ))}
    </select>
  )
}
```

## How It Works

1. **Initialization**: `VerbaProvider` creates a `Verba` instance and immediately fetches all translations from the API.

2. **Reactivity**: When translations load (`isReady` flips to `true`) or the locale changes, all components using `useVerba()` automatically re-render.

3. **Caching**: Translations are cached in memory. The SDK uses ETags for efficient cache validation.

4. **Synchronous Access**: After initialization, `t()` calls are synchronous and instant.

5. **Auto-creation**: Missing keys with default values are created in the background without blocking your app.

## Framework Examples

### Next.js App Router

```tsx
// app/providers.tsx
'use client'
import { VerbaProvider } from '@verbadev/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <VerbaProvider
      projectId="your-project-id"
      publicKey="pk_your-public-key"
    >
      {children}
    </VerbaProvider>
  )
}

// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

// app/page.tsx
'use client'
import { useVerba } from '@verbadev/react'

export default function Home() {
  const { t, isReady } = useVerba()

  if (!isReady) return <p>Loading...</p>

  return <h1>{t('welcome.title', 'Welcome to my app!')}</h1>
}
```

### Vite / Create React App

```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { VerbaProvider } from '@verbadev/react'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <VerbaProvider
      projectId="your-project-id"
      publicKey="pk_your-public-key"
    >
      <App />
    </VerbaProvider>
  </React.StrictMode>
)
```

### Locale Switcher Component

```tsx
import { useVerba } from '@verbadev/react'

const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
}

export function LocaleSwitcher() {
  const { locale, setLocale, locales } = useVerba()

  return (
    <div>
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          style={{ fontWeight: l === locale ? 'bold' : 'normal' }}
        >
          {LOCALE_NAMES[l] || l}
        </button>
      ))}
    </div>
  )
}
```

## TypeScript

The SDK is written in TypeScript and includes full type definitions.

```typescript
import { VerbaProvider, useVerba, VerbaContextValue } from '@verbadev/react'
```

**Exported types:**
- `VerbaProviderProps` - Props for the `VerbaProvider` component
- `VerbaContextValue` - Return type of `useVerba()` hook

## Peer Dependencies

- `react` >= 18
- `@verbadev/js` >= 0.2.0

## License

MIT
