import { useState } from 'react';
import { Dropdown } from '../components/Dropdown';

export default {
  title: 'Dropdown/7. From Config',
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

// ── Icons ────────────────────────────────────────────────────────────────────

function IconAll() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M3.33333 5.33335C4.06971 5.33335 4.66667 4.7364 4.66667 4.00002C4.66667 3.26364 4.06971 2.66669 3.33333 2.66669C2.59695 2.66669 2 3.26364 2 4.00002C2 4.7364 2.59695 5.33335 3.33333 5.33335ZM6 4.00002C6 3.63183 6.29848 3.33335 6.66667 3.33335H13.3333C13.7015 3.33335 14 3.63183 14 4.00002C14 4.36821 13.7015 4.66669 13.3333 4.66669H6.66667C6.29848 4.66669 6 4.36821 6 4.00002ZM6 8.00002C6 7.63183 6.29848 7.33335 6.66667 7.33335H13.3333C13.7015 7.33335 14 7.63183 14 8.00002C14 8.36821 13.7015 8.66669 13.3333 8.66669H6.66667C6.29848 8.66669 6 8.36821 6 8.00002ZM6.66667 11.3334C6.29848 11.3334 6 11.6318 6 12C6 12.3682 6.29848 12.6667 6.66667 12.6667H13.3333C13.7015 12.6667 14 12.3682 14 12C14 11.6318 13.7015 11.3334 13.3333 11.3334H6.66667ZM3.33333 9.33335C2.59695 9.33335 2 8.7364 2 8.00002C2 7.26364 2.59695 6.66669 3.33333 6.66669C4.06971 6.66669 4.66667 7.26364 4.66667 8.00002C4.66667 8.7364 4.06971 9.33335 3.33333 9.33335ZM2 12C2 12.7364 2.59695 13.3334 3.33333 13.3334C4.06971 13.3334 4.66667 12.7364 4.66667 12C4.66667 11.2636 4.06971 10.6667 3.33333 10.6667C2.59695 10.6667 2 11.2636 2 12Z" fill="currentColor" />
    </svg>
  );
}

function IconForms() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M3 2C2.44772 2 2 2.44772 2 3V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V3C14 2.44772 13.5523 2 13 2H3ZM4 4H12V6H4V4ZM4 7.5H12V9H4V7.5ZM4 10.5H9V12H4V10.5Z" fill="currentColor" />
    </svg>
  );
}

function IconAI() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2L8.8 5.2L12 6L8.8 6.8L8 10L7.2 6.8L4 6L7.2 5.2L8 2Z" fill="currentColor" />
      <path d="M12.5 10L12.9 11.6L14.5 12L12.9 12.4L12.5 14L12.1 12.4L10.5 12L12.1 11.6L12.5 10Z" fill="currentColor" />
      <path d="M3.5 9L3.8 10.2L5 10.5L3.8 10.8L3.5 12L3.2 10.8L2 10.5L3.2 10.2L3.5 9Z" fill="currentColor" />
    </svg>
  );
}

function IconPayments() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M2 4C2 3.44772 2.44772 3 3 3H13C13.5523 3 14 3.44772 14 4V5.5H2V4ZM2 7H14V12C14 12.5523 13.5523 13 13 13H3C2.44772 13 2 12.5523 2 12V7ZM4 9.5H6V11H4V9.5ZM7.5 9.5H9V11H7.5V9.5Z" fill="currentColor" />
    </svg>
  );
}

function IconWebhooks() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M8 2.5C6.067 2.5 4.5 4.067 4.5 6C4.5 6.97 4.895 7.847 5.534 8.483L4.12 11H2V13H5.88L7.294 10.483C7.524 10.494 7.76 10.5 8 10.5C9.933 10.5 11.5 8.933 11.5 7H9.5C9.5 7.828 8.828 8.5 8 8.5C7.172 8.5 6.5 7.828 6.5 7C6.5 6.172 7.172 5.5 8 5.5C8.234 5.5 8.455 5.556 8.651 5.655L10.065 3.138C9.42 2.727 8.738 2.5 8 2.5ZM11 5C10.172 5 9.5 5.672 9.5 6.5H11.5L12.914 9.017C12.455 9.331 12.15 9.852 12.15 10.45C12.15 11.308 12.842 12 13.7 12C14.558 12 15.25 11.308 15.25 10.45C15.25 9.592 14.558 8.9 13.7 8.9L12.286 6.383C12.073 5.566 11.604 5 11 5Z" fill="currentColor" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M8 1.33331C4.3181 1.33331 1.33333 4.31808 1.33333 7.99998C1.33333 11.6819 4.3181 14.6666 8 14.6666C11.6819 14.6666 14.6667 11.6819 14.6667 7.99998C14.6667 4.31808 11.6819 1.33331 8 1.33331ZM8 6.66665C8.36819 6.66665 8.66667 6.96512 8.66667 7.33331V10.6666C8.66667 11.0348 8.36819 11.3333 8 11.3333C7.63181 11.3333 7.33333 11.0348 7.33333 10.6666V7.33331C7.33333 6.96512 7.63181 6.66665 8 6.66665ZM8 4.66665C8.55228 4.66665 9 5.11436 9 5.66665C9 6.21893 8.55228 6.66665 8 6.66665C7.44772 6.66665 7 6.21893 7 5.66665C7 5.11436 7.44772 4.66665 8 4.66665Z" fill="currentColor" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2L9.44252 5.6459L13.3333 5.90983L10.3333 8.52576L11.305 12.4235L8 10.3333L4.69504 12.4235L5.66667 8.52576L2.66667 5.90983L6.55748 5.6459L8 2Z" fill="currentColor" />
    </svg>
  );
}

function ItemActions({ onAction }) {
  return (
    <>
      <button type="button" aria-label="Show details" onClick={() => onAction('details')}>
        <InfoIcon />
      </button>
      <button type="button" aria-label="Pin item" onClick={() => onAction('pin')}>
        <StarIcon />
      </button>
    </>
  );
}

// ── Config ───────────────────────────────────────────────────────────────────

const dropdownConfig = {
  trigger: { label: 'Select Field', className: 'ho-demo-trigger' },
  showAll: true,
  allLabel: 'All',
  allIcon: IconAll,
  items: [
    {
      id: 'forms',
      label: 'Forms',
      icon: IconForms,
      title: 'Forms',
      items: [
        {
          id: 'contact-form',
          label: 'Contact Form',
          items: [
            { id: 'first-name', label: 'First Name' },
            { id: 'last-name', label: 'Last Name' },
            { id: 'email', label: 'Email Address' },
            { id: 'phone', label: 'Phone Number' },
            { id: 'message', label: 'Message' },
          ],
        },
        {
          id: 'registration',
          label: 'Registration Form',
          items: [
            { id: 'reg-name', label: 'Full Name' },
            { id: 'reg-email', label: 'Email' },
            { id: 'reg-company', label: 'Company' },
            { id: 'reg-role', label: 'Role' },
          ],
        },
      ],
    },
    {
      id: 'ai-outputs',
      label: 'AI Elements',
      icon: IconAI,
      title: 'AI Elements',
      items: [
        {
          id: 'text-gen',
          label: 'Text Generation',
          items: [
            { id: 'ai-summary', label: 'Summary' },
            { id: 'ai-translation', label: 'Translation' },
            { id: 'ai-sentiment', label: 'Sentiment Score' },
          ],
        },
      ],
    },
    {
      id: 'payments',
      label: 'Payment',
      icon: IconPayments,
      title: 'Payment',
      items: [
        {
          id: 'stripe',
          label: 'Stripe',
          items: [
            { id: 'pay-amount', label: 'Amount' },
            { id: 'pay-currency', label: 'Currency' },
            { id: 'pay-status', label: 'Status' },
            { id: 'pay-id', label: 'Payment ID' },
          ],
        },
      ],
    },
    {
      id: 'webhooks',
      label: 'Webhooks',
      icon: IconWebhooks,
      title: 'Webhooks',
      items: [
        {
          id: 'webhook-data',
          label: 'Webhook Payload',
          items: [
            { id: 'wh-event', label: 'Event Type' },
            { id: 'wh-timestamp', label: 'Timestamp' },
            { id: 'wh-payload', label: 'Payload' },
          ],
        },
      ],
    },
  ],
  content: {
    searchPlaceholder: 'Search',
  },
};

// ── Stories ──────────────────────────────────────────────────────────────────

export const Basic = {
  name: 'Basic',
  args: {
    displayMode: 'scroll',
    defaultOpen: false,
    defaultGroupExpanded: true,
    hideOnSelection: true,
  },
  render: ({ displayMode, defaultOpen, defaultGroupExpanded, hideOnSelection }) => (
    <Dropdown fromConfig={{
      ...dropdownConfig,
      displayMode,
      defaultOpen,
      defaultGroupExpanded,
      hideOnSelection,
    }} />
  ),
};

export const WithAutoCollapse = {
  name: 'With Auto Collapse',
  args: {
    displayMode: 'scroll',
    defaultOpen: true,
    defaultGroupExpanded: true,
    hideOnSelection: true,
  },
  render: ({ displayMode, defaultOpen, defaultGroupExpanded, hideOnSelection }) => (
    <Dropdown fromConfig={{
      ...dropdownConfig,
      displayMode,
      defaultOpen,
      defaultGroupExpanded,
      hideOnSelection,
      autoCollapse: true,
    }} />
  ),
};

export const WithItemActions = {
  name: 'With Item Actions',
  args: {
    displayMode: 'scroll',
    defaultOpen: true,
    defaultGroupExpanded: true,
    hideOnSelection: false,
  },
  render: ({ displayMode, defaultOpen, defaultGroupExpanded, hideOnSelection }) => {
    const [activity, setActivity] = useState('Click an action button inside the config-driven dropdown.');

    function handleAction(verb, item) {
      setActivity(`${verb} -> ${item.label} (${item.type})`);
    }

    const config = {
      trigger: { label: 'Config Actions', className: 'ho-demo-trigger' },
      displayMode,
      defaultOpen,
      defaultGroupExpanded,
      hideOnSelection,
      content: {
        searchPlaceholder: 'Search actions...',
      },
      items: [
        {
          id: 'actions',
          label: 'Actions',
          items: [
            {
              label: 'Tasks',
              items: [
                {
                  id: 'roadmap',
                  label: 'Roadmap',
                  actions: (item) => <ItemActions onAction={verb => handleAction(verb, item)} />,
                },
                {
                  id: 'releases',
                  label: 'Releases',
                  actions: (item) => <ItemActions onAction={verb => handleAction(verb, item)} />,
                },
              ],
            },
            {
              label: 'Permissions',
              items: [
                {
                  id: 'view-logs',
                  label: 'View Logs',
                  type: 'checkbox',
                  defaultChecked: true,
                  actions: (item) => <ItemActions onAction={verb => handleAction(verb, item)} />,
                },
                {
                  id: 'manage-users',
                  label: 'Manage Users',
                  type: 'checkbox',
                  actions: (item) => <ItemActions onAction={verb => handleAction(verb, item)} />,
                },
              ],
            },
          ],
        },
      ],
    };

    return (
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <Dropdown fromConfig={config} />
        <div style={{ width: 240, fontSize: 12, lineHeight: 1.5, color: '#334155' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Action output</div>
          <div style={{ padding: '10px 12px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            {activity}
          </div>
          <div style={{ marginTop: 10, color: '#64748b' }}>
            The actions field works through fromConfig and does not toggle the checkbox row.
          </div>
        </div>
      </div>
    );
  },
};
