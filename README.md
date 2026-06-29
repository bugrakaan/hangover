# hangover

A React 18 compound-component Dropdown / Field Picker library.

[![npm version](https://img.shields.io/npm/v/@diabolic/hangover)](https://www.npmjs.com/package/@diabolic/hangover)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Live Demo](https://bugrakaan.github.io/hangover/)

## Features

- **Compound Components** - Composable `Dropdown.Trigger`, `Panel`, `Navigation`, `Section`, `Group`, `Item` API
- **Fuzzy Search** - Built-in fuzzy filtering across items (powered by fuse.js)
- **Two Display Modes** - Scroll-spy with smooth scroll or one-section-at-a-time tab mode
- **Left Navigation** - Optional nav column with auto-collapse and single-section auto-transform
- **Checkbox Items** - Multi-select with select-all support
- **Dark Mode** - Token-based theming with a built-in dark theme
- **Smart Positioning** - Portal-rendered panel with placement variants and auto-placement
- **Controlled & Uncontrolled** - Full control or sensible defaults out of the box
- **Imperative API** - Open, close, and drive state via `ref` with an optional external anchor
- **Config-driven Rendering** - Build entire menus from a single `fromConfig` object
- **React 18** - Compound, accessible, headless-style components

---

## Installation

```bash
npm install @diabolic/hangover
```

---

## Quick Start

```jsx
import { Dropdown } from '@diabolic/hangover'
import '@diabolic/hangover/styles'

export default function App() {
  return (
    <Dropdown>
      <Dropdown.Trigger>
        <button>Open</button>
      </Dropdown.Trigger>
      <Dropdown.Panel>
        <Dropdown.Content>
          <Dropdown.Section>
            <Dropdown.Group label="Fruits">
              <Dropdown.Item id="apple">Apple</Dropdown.Item>
              <Dropdown.Item id="banana">Banana</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
        </Dropdown.Content>
      </Dropdown.Panel>
    </Dropdown>
  )
}
```

Use the exported styles subpath above. Do not import from `dist/...` directly.

---

## Component Reference

### `<Dropdown>`

Root provider. All state lives here.

| Prop | Type | Default | Description |
|---|---|---|---|
| `displayMode` | `"scroll" \| "tab"` | `"scroll"` | How sections are navigated. `"scroll"` uses scroll-spy + smooth scroll; `"tab"` shows one section at a time. |
| `defaultOpen` | `boolean` | `false` | Panel starts open. |
| `defaultGroupExpanded` | `"first" \| true \| false` | `true` | Default expand state for all groups. `true` expands all; `false` collapses all; `"first"` expands only the first group across all sections. |
| `hideOnSelection` | `boolean` | `true` | Close the panel automatically when a `type="click"` item is selected. Set to `false` to keep the panel open. |
| `darkMode` | `boolean` | `false` | Enable dark mode. Applies `hangoverDropdown--dark` CSS class which overrides all color tokens. |
| `searchQuery` | `string` | — | Controlled search query. When provided, the internal search state is kept in sync with this value. Use together with `onEvent` (`type: "search"`) to handle changes. |
| `defaultSearchQuery` | `string` | `""` | Uncontrolled initial search query. Only applied on first render. |
| `onEvent` | `(event) => any` | — | Central event handler. See [Events](#events). |
| `ref` | `React.Ref` | — | Exposes imperative API. See [Imperative API](#imperative-api). |
| `...rest` | `any` | — | Any additional props (e.g. `data-*`, `className`, `style`) are forwarded to the root `<div>`. |

---

### `<Dropdown.Trigger>`

Wraps any single child element and turns it into the toggle trigger.

Injects `ref`, `onClick`, `aria-expanded`, `aria-haspopup` onto the child automatically — no extra props needed.

```jsx
<Dropdown.Trigger>
  <button>Open</button>
</Dropdown.Trigger>
```

`Dropdown.Trigger` is optional. When you cannot add markup inside `<Dropdown>`, use an external `anchor` ref with the imperative API instead. See [Without a Trigger](#without-a-trigger).

---

### `<Dropdown.Panel>`

Renders into a portal on `document.body`. Handles positioning, outside-click, and Escape key closing.

| Prop | Type | Default | Description |
|---|---|---|---|
| `placement` | `string` | `"bottom-start"` | Panel position relative to the trigger. Supported: `"bottom-start"`, `"bottom-end"`, `"bottom"`, `"top-start"`, `"top-end"`, `"top"`. |
| `title` | `string` | — | Optional title bar rendered at the top of the panel (above the nav/content area). Uses the same muted uppercase style as section headings. |
| `offset` | `number \| string` | `8` | Distance between trigger and panel. Accepts a number (`10`) or a px string (`"10px"`). |
| `anchor` | `React.RefObject` | — | Ref to an external DOM element used as the positioning anchor. Overrides the built-in trigger ref. Use together with the imperative API when `Dropdown.Trigger` is not in the markup. |
| `component` | `React component` | — | Custom wrapper component. |
| `...rest` | `any` | — | Any additional props are forwarded to the panel `<div>` (or `component`). |

---

### `<Dropdown.Navigation>`

Left navigation column. When present, the panel switches to a two-column layout.

| Prop | Type | Default | Description |
|---|---|---|---|
| `showAll` | `boolean` | `false` | Automatically prepends an **All** nav item with id `"__all__"`. |
| `allLabel` | `string` | `"All"` | Label for the auto-prepended All item. |
| `allIcon` | `ReactNode \| FC` | — | Icon for the auto-prepended All item. |
| `collapsed` | `boolean` | `false` | Start the nav column in collapsed state. |
| `autoCollapse` | `boolean` | `false` | Automatically collapse the nav column when the viewport is too narrow to fit the full panel width (derived from `--hangover-nav-width` + `--hangover-content-max-width`). |
| `component` | `React component` | — | Custom wrapper component. |
| `...rest` | `any` | — | Any additional props are forwarded to the nav column wrapper `<div>` (or `component`). |

> **Single-section auto-transform** — When `<Dropdown.Navigation>` has exactly one child item (excluding the auto-prepended All item), the nav column is hidden automatically and section titles are suppressed. No extra prop is needed; it is detected at render time.

```jsx
{/* Nav column and section title disappear automatically */}
<Dropdown.Navigation showAll>
  <Dropdown.NavigationItem id="metrics">Metrics</Dropdown.NavigationItem>
</Dropdown.Navigation>
```

Renders `Dropdown.NavigationItem` children inside a `forNavigation` column.

Use `showAll` to automatically prepend an **All** item:

```jsx
<Dropdown.Navigation showAll>
  <Dropdown.NavigationItem id="fruits" icon={<IconFruits />}>Fruits</Dropdown.NavigationItem>
</Dropdown.Navigation>
```

Or provide a custom label/icon for the All item:

```jsx
<Dropdown.Navigation showAll allLabel="Everything" allIcon={IconAll}>
  <Dropdown.NavigationItem id="fruits">Fruits</Dropdown.NavigationItem>
</Dropdown.Navigation>
```

---

### `<Dropdown.NavigationItem>`

A single item in the navigation column.

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | **required** | Must match the `forId` of a `Dropdown.Section`. |
| `icon` | `ReactNode \| FC` | — | Icon displayed left of the label. |
| `component` | `React component` | — | Custom component. Receives `isActive`, `onClick`, `id`. |
| `...rest` | `any` | — | Any additional props are forwarded to the `<button>` (or `component`). `onClick` is composed with the internal nav handler. |

In `displayMode="scroll"`, clicking a nav item smooth-scrolls to the matching section. The active item is updated automatically as the user scrolls (scroll spy).

---

### `<Dropdown.Content>`

Right content column. Contains the search bar and the scrollable item list.

| Prop | Type | Default | Description |
|---|---|---|---|
| `searchPlaceholder` | `string` | `"Search"` | Placeholder text for the search input. |
| `emptyText` | `string` | `"Nothing to show here"` | Text shown when `Content` has no children at all (empty state). The search bar is also hidden in this state. |
| `component` | `React component` | — | Custom wrapper component. |
| `...rest` | `any` | — | Any additional props are forwarded to the content column `<div>` (or `component`). |

---

### `<Dropdown.Section>`

Groups `Dropdown.Group` / `Dropdown.Item` elements under a nav scope.

| Prop | Type | Default | Description |
|---|---|---|---|
| `forId` | `string` | `"__all__"` | Matches a `Dropdown.NavigationItem` id. Defaults to `"__all__"`, so it can be omitted when there's no navigation. Also accepts `for` (JSX alias). |
| `title` | `string` | — | Section heading shown in `displayMode="scroll"`. Sticks to the top of the scroll container while the section is in view. |
| `...rest` | `any` | — | Any additional props are forwarded to the section wrapper `<div>`. |

```jsx
{/* With nav */}
<Dropdown.Section forId="fruits" title="Fruits">
  ...
</Dropdown.Section>

{/* Without nav — forId can be omitted */}
<Dropdown.Section>
  ...
</Dropdown.Section>
```

---

### `<Dropdown.Group>`

A collapsible group of items with a colored left-border accent.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | **required** | Group heading text. |
| `id` | `string` | auto | Stable identifier for the imperative API (`ref.current.selectAll(id)`). Auto-derived from `label` if omitted (`"Team Members"` → `"team_members"`). Provide an explicit `id` when using the imperative API. |
| `icon` | `ReactNode \| FC` | — | Icon displayed left of the group label in the header bar. |
| `color` | `string` | auto | CSS color for the left accent bar. Auto-assigned from a built-in palette if omitted. |
| `defaultExpanded` | `boolean` | — | Override the root-level `defaultGroupExpanded` for this specific group. |
| `showSelectAll` | `boolean` | `false` | Shows a "Select all" checkbox item inside the group. |
| `selectAllPosition` | `"top" \| "bottom"` | `"bottom"` | Position of the select-all item. |
| `emptyText` | `string` | `"Nothing to show here"` | Text shown when the group has no children. |
| `noResultsText` | `string` | `"No results"` | Text shown when a search query returns no matching items inside this group. |
| `component` | `React component` | — | Custom wrapper component. |
| `...rest` | `any` | — | Any additional props are forwarded to the group wrapper `<div>` (or `component`). |

---

### `<Dropdown.Item>`

A single selectable or checkable item.

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | **required** | Unique identifier for this item. |
| `type` | `"click" \| "checkbox"` | `"click"` | Interaction mode. `"click"` triggers a `select` event; `"checkbox"` triggers a `check` event. |
| `icon` | `ReactNode \| FC` | — | Icon displayed left of the item label. |
| `defaultChecked` | `boolean` | `false` | Initial checked state (uncontrolled, `type="checkbox"` only). |
| `checkIcon` | `ReactNode \| FC` | built-in ✓ | Custom check icon. |
| `component` | `React component` | — | Custom component. Receives `isSelected`, `isChecked`, `onClick`. |
| `...rest` | `any` | — | Any additional props are forwarded to the item `<div>` (or `component`). `onClick` and `onKeyDown` are composed with the internal selection handlers. |

Items are automatically filtered when the user types in the search box.

---

## `fromConfig` — config-driven rendering

Pass a plain JS object to the `fromConfig` prop on `<Dropdown>` to render the entire tree without writing JSX. Useful for server-driven UIs or stored configurations.

> `fromConfig` and `children` cannot be used together — `fromConfig` takes precedence.

```jsx
<Dropdown fromConfig={config} />
```

### Config schema

Any unknown props at any level are forwarded as-is to the underlying component. This means you can pass `data-*` attributes, `onClick`, `onMouseEnter`, or any other prop directly in the config object:

```js
// Example — data-test and onClick on a specific item
{ id: 'name', label: 'Name', 'data-test': 'field-name', onClick: handleClick }
```

```js
const config = {
  // Root props (all optional)
  displayMode: 'scroll' | 'tab',
  defaultOpen: boolean,
  defaultGroupExpanded: boolean | 'first',
  hideOnSelection: boolean,
  onEvent: ({ type, payload, prev }) => any,
  // ...any extra props are spread onto <Dropdown>

  // Trigger — required
  trigger: ReactNode | string | {
    label: string,
    className?: string,
    component?: ComponentType,
  },

  // Panel (optional)
  panel?: {
    placement?: string,  // default 'bottom-start'
    offset?: number,  // default 8
  },

  // Navigation column (optional)
  navigation?: { ... },   // legacy alias, still supported
  items?: [               // preferred root config for navigation items
    {
      id?: string,
      label: string,
      icon?: ReactNode | FC,
      title?: string,
      items?: [
        {
          id?: string,
          label?: string,
          icon?: ReactNode | FC,
          color?: string,
          defaultExpanded?: boolean,
          showSelectAll?: boolean,
          selectAllPosition?: 'top' | 'bottom',
          emptyText?: string,
          noResultsText?: string,
          items: [
            {
              id: string,
              label: string,
              icon?: ReactNode | FC,
              type?: 'click' | 'checkbox',
              defaultChecked?: boolean,
              checkIcon?: ReactNode | FC,
              actions?: ReactNode | ((item) => ReactNode),
              component?: ComponentType,
            },
          ],
        },
      ],
    },
  ],
  showAll?: boolean,
  allLabel?: string,
  allIcon?: ReactNode | FC,
  collapsed?: boolean,
  autoCollapse?: boolean,

  // Content column — required
  content: {
    searchPlaceholder?: string,
    emptyText?: string,   // shown when no sections/groups are provided
    sections: [
      {
        for?: string,   // optional when section content lives under items[]
        title?: string,
        groups?: [
          {
            id?: string,
            label?: string,
            icon?: ReactNode | FC,
            color?: string,
            defaultExpanded?: boolean,
            showSelectAll?: boolean,
            selectAllPosition?: 'top' | 'bottom',
            emptyText?: string,
            noResultsText?: string,
            items: [
              {
                id: string,
                label: string,
                icon?: ReactNode | FC,
                type?: 'click' | 'checkbox',
                defaultChecked?: boolean,
                checkIcon?: ReactNode | FC,
                actions?: ReactNode | ((item) => ReactNode),
                component?: ComponentType,
              },
            ],
          },
        ],
        items?: [
          {
            id?: string,
            label?: string,
            icon?: ReactNode | FC,
            color?: string,
            defaultExpanded?: boolean,
            showSelectAll?: boolean,
            selectAllPosition?: 'top' | 'bottom',
            emptyText?: string,
            noResultsText?: string,
            items: [
              {
                id: string,
                label: string,
                icon?: ReactNode | FC,
                type?: 'click' | 'checkbox',
                defaultChecked?: boolean,
                checkIcon?: ReactNode | FC,
                actions?: ReactNode | ((item) => ReactNode),
                component?: ComponentType,
                // ...any extra props (data-*, onClick, onMouseEnter, …) are forwarded to <DropdownItem>
              },
            ],
          },
        ],
      },
    ],
  },
}
```

### Example

```jsx
import { Dropdown } from '@diabolic/hangover'

const config = {
  trigger: 'Select fields',
  showAll: true,
  items: [
    {
      id: 'basic',
      label: 'Basic',
      title: 'Basic',
      items: [
        {
          label: 'Identity',
          items: [
            { id: 'name', label: 'Name' },
            { id: 'email', label: 'Email' },
          ],
        },
      ],
    },
    {
      id: 'advanced',
      label: 'Advanced',
      title: 'Advanced',
      items: [
        {
          label: 'System',
          items: [
            { id: 'created-at', label: 'Created at' },
            { id: 'updated-at', label: 'Updated at' },
          ],
        },
      ],
    },
  ],
  content: {
    searchPlaceholder: 'Search fields...',
  },
}

export default function App() {
  return <Dropdown fromConfig={config} />
}
```

---

## Events

All events are delivered via the `onEvent` prop on `<Dropdown>`.

```jsx
<Dropdown onEvent={({ type, payload, prev }) => {
  console.log(type, payload)
}}>
```

| Event type | `payload` | `prev` | Description |
|---|---|---|---|
| `open` | `{ trigger }` | — | Panel opened. `trigger`: `"click" \| "imperative"`. |
| `close` | `{ trigger }` | — | Panel closed. `trigger`: `"click" \| "outside" \| "escape" \| "imperative"`. |
| `select` | `{ id, label, groupId, groupLabel }` | `{ id, label } \| null` | An item was clicked (`type="click"`). |
| `check` | `{ id, label, groupId, groupLabel }` | `{ checked }` | A checkbox item was toggled. |
| `selectAll` | `{ groupId, groupLabel, itemIds }` | `{ checked }` | Select-all was toggled. |
| `navChange` | `{ id }` | `{ id }` | Active nav item changed. |
| `search` | `{ query }` | `{ query }` | Search input changed. |
| `groupToggle` | `{ groupId, groupLabel, expanded }` | — | A group was expanded or collapsed. |

### Cancelling an event

Return `null` from `onEvent` to cancel the state update:

```jsx
<Dropdown onEvent={({ type, payload }) => {
  if (type === 'select' && payload.id === 'locked') return null // cancel
}}>
```

### Native DOM events

Each event also fires a native `CustomEvent` on the trigger element:

```js
trigger.addEventListener('HO:select', (e) => {
  console.log(e.detail) // { payload, prev }
})
```

---

## Imperative API

Attach a `ref` to `<Dropdown>` to control it programmatically from **outside** the tree:

```jsx
const dropdownRef = useRef()

<Dropdown ref={dropdownRef}>
  ...
</Dropdown>
```

| Method | Returns | Description |
|---|---|---|
| `open()` | — | Open the panel. |
| `close()` | — | Close the panel. |
| `toggle()` | — | Toggle open/close. |
| `isOpen()` | `boolean` | Current open state. |
| `getSelected()` | `{ id, label } \| null` | Currently selected item. |
| `getChecked()` | `Map<id, boolean>` | All checkbox states. |
| `getActiveNavItem()` | `string` | Active nav item id. |
| `setSearch(query)` | — | Programmatically set the search query. |
| `selectAll(groupId, checked?)` | — | Toggle or force the select-all state of a group. `groupId` matches the `id` prop on `<Dropdown.Group>`. Omit `checked` to toggle; pass `true`/`false` to force. |

```jsx
const ref = useRef()

// toggle
ref.current.selectAll('metrics')

// force on / force off
ref.current.selectAll('metrics', true)
ref.current.selectAll('metrics', false)
```

---

## `useDropdown` Hook

Use `useDropdown()` to read state and trigger actions from **inside** the dropdown tree — for example inside a custom component passed via the `component` prop.

```jsx
import { useDropdown } from '@diabolic/hangover'

function MyCustomItem({ isSelected, onClick, children }) {
  const { searchQuery, activeNavId, close } = useDropdown()
  // ...
}

<Dropdown.Item id="foo" component={MyCustomItem}>Foo</Dropdown.Item>
```

Must be called inside a `<Dropdown>` subtree.

### Returns

**Reactive state** — triggers re-render when the value changes:

| Property | Type | Description |
|---|---|---|
| `isOpen` | `boolean` | Panel open state. |
| `selectedItem` | `{ id, label } \| null` | Currently selected item. |
| `checkedItems` | `Map<id, boolean>` | All checkbox states. |
| `activeNavId` | `string` | Active navigation item id. |
| `activeNavLabel` | `string` | Label of the active navigation item. |
| `searchQuery` | `string` | Current search input value. |
| `displayMode` | `"scroll" \| "tab"` | Display mode of the dropdown. |
| `darkMode` | `boolean` | Dark mode state. |

**Actions** — stable references, safe to use in `useEffect` / `useCallback` deps:

| Method | Description |
|---|---|
| `open()` | Open the panel. |
| `close()` | Close the panel. |
| `toggle()` | Toggle open/closed. |
| `setSearch(query)` | Update the search query. |
| `fireEvent(type, payload)` | Fire any internal event. Useful for advanced / unforeseen scenarios. Return `null` from `onEvent` to cancel. |

### Example — custom trigger with current state

```jsx
import { useDropdown } from '@diabolic/hangover'

function SmartTrigger() {
  const { isOpen, selectedItem, toggle } = useDropdown()

  return (
    <button onClick={toggle}>
      {selectedItem ? selectedItem.label : 'Select a field'}
      {isOpen ? ' ▲' : ' ▼'}
    </button>
  )
}

<Dropdown>
  <Dropdown.Trigger>
    <SmartTrigger />
  </Dropdown.Trigger>
  ...
</Dropdown>
```

### Example — close panel from inside a custom item

```jsx
function MyItem({ isSelected, onClick, children }) {
  const { close } = useDropdown()

  return (
    <div onClick={() => { onClick(); close() }}>
      {children}
    </div>
  )
}
```

### Example — react to search query inside a custom component

```jsx
function MyContent({ children }) {
  const { searchQuery, activeNavLabel } = useDropdown()

  return (
    <div>
      {searchQuery && <p>Results for "{searchQuery}" in {activeNavLabel}</p>}
      {children}
    </div>
  )
}
```

---

## Recipes

### With icons on groups and items

```jsx
function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M8 2a2.667 2.667 0 1 1 0 5.333A2.667 2.667 0 0 1 8 2Zm0 6.667c-3.2 0-5.333 1.6-5.333 2.666V12h10.666v-.667C13.333 10.267 11.2 8.667 8 8.667Z" fill="currentColor" />
    </svg>
  )
}

function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M2 3.333A.667.667 0 0 1 2.667 2.667h10.666A.667.667 0 0 1 14 3.333v9.334a.667.667 0 0 1-.667.666H2.667A.667.667 0 0 1 2 12.667V3.333Zm1.333.92V12h9.334V4.253L8 7.92 3.333 4.253ZM12.24 4H3.76L8 6.747 12.24 4Z" fill="currentColor" />
    </svg>
  )
}

<Dropdown.Group label="Contact" icon={IconUser}>
  <Dropdown.Item id="name" icon={IconUser}>Full Name</Dropdown.Item>
  <Dropdown.Item id="email" icon={IconMail}>Email Address</Dropdown.Item>
</Dropdown.Group>
```

Icons inherit the item's text color via `currentColor` — they automatically adapt to hover, active, and dark mode states.

---

### Dark mode

```jsx
<Dropdown darkMode>
  <Dropdown.Trigger><button>Open</button></Dropdown.Trigger>
  <Dropdown.Panel>
    ...
  </Dropdown.Panel>
</Dropdown>
```

---

### Panel title

```jsx
<Dropdown.Panel title="Select a field">
  ...
</Dropdown.Panel>
```

---

### Empty content state

When `<Dropdown.Content>` has no children, the search bar is hidden and an empty message is shown:

```jsx
<Dropdown.Content emptyText="No fields available">
  {/* no children */}
</Dropdown.Content>
```

---

### Search no-results per group

```jsx
<Dropdown.Group label="Metrics" noResultsText="No metrics match your search">
  <Dropdown.Item id="revenue">Revenue</Dropdown.Item>
  <Dropdown.Item id="sessions">Sessions</Dropdown.Item>
</Dropdown.Group>
```

---

### Controlled search query

Drive the search input from outside — connect it to your own state or a URL param:

```jsx
const [query, setQuery] = useState('')

<input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search..." />

<Dropdown
  searchQuery={query}
  onEvent={({ type, payload }) => {
    if (type === 'search') setQuery(payload.query)
  }}
>
  ...
</Dropdown>
```

Or use `defaultSearchQuery` to set the initial value without controlling it:

```jsx
<Dropdown defaultSearchQuery="rev">
  ...
</Dropdown>
```

---

### With left navigation (scroll mode)

```jsx
<Dropdown displayMode="scroll">
  <Dropdown.Trigger><button>Browse</button></Dropdown.Trigger>
  <Dropdown.Panel>
    <Dropdown.Navigation showAll>
      <Dropdown.NavigationItem id="fruits">Fruits</Dropdown.NavigationItem>
      <Dropdown.NavigationItem id="vegetables">Vegetables</Dropdown.NavigationItem>
    </Dropdown.Navigation>
    <Dropdown.Content>
      <Dropdown.Section forId="fruits" title="Fruits">
        <Dropdown.Group label="Citrus">
          <Dropdown.Item id="orange">Orange</Dropdown.Item>
          <Dropdown.Item id="lemon">Lemon</Dropdown.Item>
        </Dropdown.Group>
      </Dropdown.Section>
      <Dropdown.Section forId="vegetables" title="Vegetables">
        <Dropdown.Group label="Leafy">
          <Dropdown.Item id="spinach">Spinach</Dropdown.Item>
        </Dropdown.Group>
      </Dropdown.Section>
    </Dropdown.Content>
  </Dropdown.Panel>
</Dropdown>
```

### Checkbox mode with select-all

```jsx
<Dropdown>
  <Dropdown.Trigger><button>Select fields</button></Dropdown.Trigger>
  <Dropdown.Panel>
    <Dropdown.Content>
      <Dropdown.Section>
        <Dropdown.Group label="Metrics" showSelectAll>
          <Dropdown.Item id="revenue" type="checkbox">Revenue</Dropdown.Item>
          <Dropdown.Item id="sessions" type="checkbox">Sessions</Dropdown.Item>
          <Dropdown.Item id="bounce" type="checkbox">Bounce rate</Dropdown.Item>
        </Dropdown.Group>
      </Dropdown.Section>
    </Dropdown.Content>
  </Dropdown.Panel>
</Dropdown>
```

### Controlled — prevent selection

```jsx
<Dropdown onEvent={({ type, payload }) => {
  if (type === 'select' && payload.id === 'locked') {
    alert('This item is locked')
    return null // cancel
  }
}}>
  ...
</Dropdown>
```

### Collapse all groups by default

```jsx
<Dropdown defaultGroupExpanded={false}>
  ...
</Dropdown>
```

### Expand only the first group

```jsx
<Dropdown defaultGroupExpanded="first">
  ...
</Dropdown>
```

### Custom panel placement and offset

```jsx
{/* Open above the trigger, aligned to the right edge, 16px gap */}
<Dropdown.Panel placement="top-end" offset={16}>
  ...
</Dropdown.Panel>
```

### Without a Trigger

When you cannot wrap the toggle button inside `<Dropdown>`, use an external `anchor` ref and control the panel via the [Imperative API](#imperative-api):

```jsx
const dropdownRef = useRef()
const buttonRef = useRef()

// The button lives anywhere in the tree — outside <Dropdown> if needed
<button ref={buttonRef} onClick={() => dropdownRef.current.toggle()}>
  Open
</button>

<Dropdown ref={dropdownRef}>
  <Dropdown.Panel anchor={buttonRef}>
    <Dropdown.Content>
      <Dropdown.Section>
        <Dropdown.Group label="Items">
          <Dropdown.Item id="one">One</Dropdown.Item>
        </Dropdown.Group>
      </Dropdown.Section>
    </Dropdown.Content>
  </Dropdown.Panel>
</Dropdown>
```

`Dropdown.Trigger` is not needed in this pattern. The `anchor` ref is used for positioning and outside-click detection.

---

### Collapsible / auto-collapsing navigation

```jsx
{/* Start collapsed */}
<Dropdown.Navigation collapsed>
  ...
</Dropdown.Navigation>

{/* Auto-collapse when the viewport is too narrow */}
<Dropdown.Navigation autoCollapse>
  ...
</Dropdown.Navigation>
```

The `autoCollapse` threshold is `--hangover-nav-width` + `--hangover-content-max-width`. Override either token to tune the breakpoint.

---

### Custom component slot

Every compound component accepts a `component` prop to swap the root element:

```jsx
<Dropdown.Item id="foo" component={MyCustomRow}>
  Foo
</Dropdown.Item>
```

---

## CSS Tokens

All visual properties are configurable via CSS custom properties:

```css
.hangoverDropdown {
  --hangover-font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  --hangover-font-size-base: 14px;
  --hangover-font-size-sm: 12px;

  /* Text */
  --hangover-color-text: #0a1551;
  --hangover-color-text-muted: #8a9ab5;

  /* Backgrounds */
  --hangover-color-bg-panel: #ffffff;
  --hangover-color-bg-title: #eceef5;
  --hangover-color-bg-nav: #F5F6FC;
  --hangover-color-bg-nav-hover: #EAECF5;
  --hangover-color-bg-nav-active: #E0E3EF;
  --hangover-color-bg-hover: #f3f3fe;
  --hangover-color-bg-hover-dark: #eaeaf9;
  --hangover-color-bg-selected: #eef2ff;
  --hangover-color-bg-checked: #EDF8FF;

  /* Border & misc */
  --hangover-color-border: #e2e8f0;
  --hangover-color-search-ph: #979DC6;
  --hangover-color-search-icon: #343C6A;
  --hangover-color-focus: #3b82f6;
  --hangover-group-default-color: #16a34a;

  /* Shape */
  --hangover-radius-panel: 4px;
  --hangover-radius-item: 4px;
  --hangover-radius-nav-item: 4px;

  --hangover-shadow-panel:
    0 8px 16px 0 rgba(84, 95, 111, 0.16),
    0 2px 4px 0 rgba(37, 45, 91, 0.04);

  /* Layout */
  --hangover-nav-width: 172px;
  --hangover-content-max-width: 240px;
  --hangover-list-max-height: 280px;

  --hangover-transition: 330ms ease;
}
```

### Dark mode

Pass `darkMode` to `<Dropdown>` to apply a pre-built dark palette:

```jsx
<Dropdown darkMode>
  ...
</Dropdown>
```

To customise dark mode colors, override the tokens inside `.hangoverDropdown--dark`:

```css
.hangoverDropdown--dark {
  --hangover-color-bg-panel: #1a1d2e;
  --hangover-color-text: #dde1f5;
  /* ... */
}
```

---

## Storybook

Explore all components and interactions in the [live demo](https://bugrakaan.github.io/hangover/).

Run locally:

```bash
npm run storybook
```

Build the static demo site (output in `storybook-static/`):

```bash
npm run build-storybook
```

Stories are located in `src/stories/`:

| Story | Description |
|---|---|
| 1. Basic | Basic usage, with/without nav, single-section auto-transform, open by default, empty state |
| 2. Scroll Spy | Scroll-spy with nav icons, collapsible navigation, long text stress test |
| 3. Tab Mode | `displayMode="tab"` |
| 4. Checkbox | Checkbox items, select-all |
| 5. Controlled | Controlled state, external anchor + imperative API |
| 6. Events | Live event stream, cancel event |
| 7. Placement | All panel placement variants, auto-placement with scroll |
| 8. From Config | `fromConfig` prop — config-driven rendering with and without auto-collapse |

---

## License

MIT
