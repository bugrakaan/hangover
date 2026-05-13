import { useState } from 'react';
import { Dropdown } from '../components/Dropdown';

export default {
  title: 'Dropdown/6. Events',
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    displayMode: {
      control: 'radio',
      options: ['scroll', 'tab'],
      description: 'Navigation mode',
    },
    defaultOpen: {
      control: 'boolean',
      description: 'Panel starts open',
    },
    defaultGroupExpanded: {
      control: 'radio',
      options: [true, false, 'first'],
      description: 'Initial expand state for groups',
    },
    hideOnSelection: {
      control: 'boolean',
      description: 'Close panel when an item is selected',
    },
  },
};

const EVENT_COLORS = {
  open: '#22c55e',
  close: '#ef4444',
  select: '#3b82f6',
  check: '#8b5cf6',
  selectAll: '#f59e0b',
  navChange: '#0ea5e9',
  search: '#64748b',
  groupToggle: '#f97316',
};

function EventLog({ events }) {
  if (!events.length) {
    return (
      <div style={{ color: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }}>
        No events yet. Interact with the dropdown.
      </div>
    );
  }
  return (
    <div style={{ fontFamily: 'monospace', fontSize: 12 }}>
      {events.map((e, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'flex-start' }}>
          <span style={{
            background: EVENT_COLORS[e.type] ?? '#64748b',
            color: '#fff',
            borderRadius: 4,
            padding: '1px 6px',
            fontWeight: 600,
            flexShrink: 0,
            fontSize: 11,
          }}>
            {e.type}
          </span>
          <span style={{ color: '#94a3b8' }}>
            {JSON.stringify(e.payload)}
          </span>
          <span style={{ color: '#475569', marginLeft: 'auto', flexShrink: 0 }}>
            {e.time}
          </span>
        </div>
      ))}
    </div>
  );
}

export const AllEvents = {
  name: 'All Events',
  args: {
    displayMode: 'scroll',
    defaultOpen: false,
    defaultGroupExpanded: true,
    hideOnSelection: true,
  },
  render: ({ displayMode, defaultOpen, defaultGroupExpanded, hideOnSelection }) => {
    const [events, setEvents] = useState([]);

    function handleEvent({ type, payload, prev }) {
      const time = new Date().toLocaleTimeString('en', { hour12: false });
      setEvents(prev => [{ type, payload, time }, ...prev].slice(0, 12));
    }

    return (
      <div>
        <Dropdown
          displayMode={displayMode}
          defaultOpen={defaultOpen}
          defaultGroupExpanded={defaultGroupExpanded}
          hideOnSelection={hideOnSelection}
          onEvent={handleEvent}
        >
          <Dropdown.Trigger>
            <button type="button" className="ho-demo-trigger">Open (watch events →)</button>
          </Dropdown.Trigger>
          <Dropdown.Panel>
            <Dropdown.Content>
              <Dropdown.Section>
                <Dropdown.Group label="Select items" selectAll>
                  <Dropdown.Item id="alpha" type="checkbox">Alpha</Dropdown.Item>
                  <Dropdown.Item id="beta" type="checkbox">Beta</Dropdown.Item>
                  <Dropdown.Item id="gamma" type="checkbox">Gamma</Dropdown.Item>
                </Dropdown.Group>
                <Dropdown.Group label="Click items">
                  <Dropdown.Item id="one">One</Dropdown.Item>
                  <Dropdown.Item id="two">Two</Dropdown.Item>
                  <Dropdown.Item id="three">Three</Dropdown.Item>
                </Dropdown.Group>
              </Dropdown.Section>
            </Dropdown.Content>
          </Dropdown.Panel>
        </Dropdown>

        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 480,
          background: '#0f172a',
          borderRadius: 8,
          padding: '12px 16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 9999,
        }}>
          <div style={{ fontWeight: 600, fontSize: 11, marginBottom: 10, color: '#94a3b8', fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Event stream
          </div>
          <EventLog events={events} />
        </div>
      </div>
    );
  },
};

export const CancelEvent = {
  name: 'Cancel Event (return null)',
  args: {
    displayMode: 'scroll',
    defaultOpen: false,
    defaultGroupExpanded: true,
    hideOnSelection: true,
  },
  render: ({ displayMode, defaultOpen, defaultGroupExpanded, hideOnSelection }) => {
    const [blocked, setBlocked] = useState([]);

    function handleEvent({ type, payload }) {
      if (type === 'select' && payload.id === 'locked') {
        setBlocked(prev => [`Blocked: select "${payload.label}"`, ...prev].slice(0, 5));
        return null; // cancel the selection
      }
    }

    return (
      <div style={{ display: 'flex', gap: 48, alignItems: 'flex-start' }}>
        <Dropdown
          displayMode={displayMode}
          defaultOpen={defaultOpen}
          defaultGroupExpanded={defaultGroupExpanded}
          hideOnSelection={hideOnSelection}
          onEvent={handleEvent}
        >
          <Dropdown.Trigger>
            <button type="button" className="ho-demo-trigger">Select (some locked)</button>
          </Dropdown.Trigger>
          <Dropdown.Panel>
            <Dropdown.Content>
              <Dropdown.Section>
                <Dropdown.Group label="Items">
                  <Dropdown.Item id="free1">Free Item 1</Dropdown.Item>
                  <Dropdown.Item id="free2">Free Item 2</Dropdown.Item>
                  <Dropdown.Item id="locked">🔒 Locked Item</Dropdown.Item>
                  <Dropdown.Item id="free3">Free Item 3</Dropdown.Item>
                </Dropdown.Group>
              </Dropdown.Section>
            </Dropdown.Content>
          </Dropdown.Panel>
        </Dropdown>

        <div style={{ minWidth: 260, fontFamily: 'monospace', fontSize: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 10, color: '#1e293b' }}>Blocked actions</div>
          {blocked.length
            ? blocked.map((b, i) => <div key={i} style={{ color: '#ef4444', marginBottom: 4 }}>{b}</div>)
            : <div style={{ color: '#94a3b8' }}>Click the locked item to see it blocked.</div>
          }
        </div>
      </div>
    );
  },
};
