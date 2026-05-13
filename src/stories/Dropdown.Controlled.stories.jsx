import { useRef, useState } from 'react';
import { Dropdown } from '../components/Dropdown';

export default {
  title: 'Dropdown/5. Controlled',
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

export const Controlled = {
  args: {
    displayMode: 'scroll',
    defaultOpen: false,
    defaultGroupExpanded: true,
    hideOnSelection: true,
  },
  render: ({ displayMode, defaultOpen, defaultGroupExpanded, hideOnSelection }) => {
    const [selected, setSelected] = useState(null);
    const [log, setLog] = useState([]);

    function handleEvent({ type, payload }) {
      setLog(prev => [`${type}: ${JSON.stringify(payload)}`, ...prev].slice(0, 5));
      if (type === 'select') {
        setSelected(payload);
      }
    }

    return (
      <>
        <Dropdown
          displayMode={displayMode}
          defaultOpen={defaultOpen}
          defaultGroupExpanded={defaultGroupExpanded}
          hideOnSelection={hideOnSelection}
          onEvent={handleEvent}
        >
          <Dropdown.Trigger>
            <button type="button" className="ho-demo-trigger">
              {selected ? selected.label : 'Select a country'}
            </button>
          </Dropdown.Trigger>
          <Dropdown.Panel>
            <Dropdown.Content>
              <Dropdown.Section>
                <Dropdown.Group label="Europe">
                  <Dropdown.Item id="de">Germany</Dropdown.Item>
                  <Dropdown.Item id="fr">France</Dropdown.Item>
                  <Dropdown.Item id="es">Spain</Dropdown.Item>
                  <Dropdown.Item id="it">Italy</Dropdown.Item>
                </Dropdown.Group>
                <Dropdown.Group label="Americas">
                  <Dropdown.Item id="us">United States</Dropdown.Item>
                  <Dropdown.Item id="ca">Canada</Dropdown.Item>
                  <Dropdown.Item id="br">Brazil</Dropdown.Item>
                </Dropdown.Group>
              </Dropdown.Section>
            </Dropdown.Content>
          </Dropdown.Panel>
        </Dropdown>

        <div style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          fontSize: 12,
          fontFamily: 'monospace',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          padding: '10px 14px',
          minWidth: 260,
          maxWidth: 340,
          zIndex: 9999,
        }}>
          <div style={{ fontWeight: 600, marginBottom: 6, color: '#0f172a' }}>Event log</div>
          {log.length === 0
            ? <div style={{ color: '#94a3b8' }}>No events yet</div>
            : log.map((entry, i) => (
              <div key={i} style={{ color: '#64748b', marginBottom: 2, wordBreak: 'break-all' }}>{entry}</div>
            ))
          }
        </div>
      </>
    );
  },
};

export const WithoutTrigger = {
  argTypes: {
    displayMode: { table: { disable: true } },
  },
  name: 'Without Trigger (anchor + ref)',
  render: () => {
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const [label, setLabel] = useState('Select a country');

    function handleEvent({ type, payload }) {
      if (type === 'select') {
        setLabel(payload.label);
      }
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0, textAlign: 'center', maxWidth: 340 }}>
          The button below lives <strong>outside</strong> of <code>&lt;Dropdown&gt;</code>. It opens the panel
          via the imperative API. The panel positions itself relative to the <code>anchor</code> ref.
        </p>

        {/* Trigger lives outside <Dropdown> */}
        <button
          ref={buttonRef}
          type="button"
          className="ho-demo-trigger"
          onClick={() => dropdownRef.current.toggle()}
        >
          {label}
        </button>

        <Dropdown ref={dropdownRef} hideOnSelection onEvent={handleEvent}>
          <Dropdown.Panel anchor={buttonRef} placement="bottom-start">
            <Dropdown.Content>
              <Dropdown.Section>
                <Dropdown.Group label="Europe">
                  <Dropdown.Item id="de">Germany</Dropdown.Item>
                  <Dropdown.Item id="fr">France</Dropdown.Item>
                  <Dropdown.Item id="es">Spain</Dropdown.Item>
                  <Dropdown.Item id="it">Italy</Dropdown.Item>
                </Dropdown.Group>
                <Dropdown.Group label="Americas">
                  <Dropdown.Item id="us">United States</Dropdown.Item>
                  <Dropdown.Item id="ca">Canada</Dropdown.Item>
                  <Dropdown.Item id="br">Brazil</Dropdown.Item>
                </Dropdown.Group>
              </Dropdown.Section>
            </Dropdown.Content>
          </Dropdown.Panel>
        </Dropdown>
      </div>
    );
  },
};
