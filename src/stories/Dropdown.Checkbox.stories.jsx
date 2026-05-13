import { useState } from 'react';
import { Dropdown } from '../components/Dropdown';

export default {
  title: 'Dropdown/4. Checkbox',
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    displayMode: { table: { disable: true } },
    defaultOpen: {
      control: 'boolean',
      description: 'Panel starts open',
    },
    defaultGroupExpanded: {
      control: 'radio',
      options: [true, false, 'first'],
      description: 'Initial expand state for groups',
    },
    hideOnSelection: { table: { disable: true } },
  },
};

export const Checkbox = {
  args: {
    defaultOpen: false,
    defaultGroupExpanded: true,
  },
  render: ({ defaultOpen, defaultGroupExpanded }) => (
    <Dropdown defaultOpen={defaultOpen} defaultGroupExpanded={defaultGroupExpanded}>
      <Dropdown.Trigger>
        <button type="button" className="ho-demo-trigger">Select Multiple</button>
      </Dropdown.Trigger>
      <Dropdown.Panel>
        <Dropdown.Content>
          <Dropdown.Section>
            <Dropdown.Group label="Permissions">
              <Dropdown.Item id="read" type="checkbox">Read</Dropdown.Item>
              <Dropdown.Item id="write" type="checkbox">Write</Dropdown.Item>
              <Dropdown.Item id="delete" type="checkbox">Delete</Dropdown.Item>
              <Dropdown.Item id="admin" type="checkbox">Admin</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Notifications">
              <Dropdown.Item id="email" type="checkbox" defaultChecked>Email</Dropdown.Item>
              <Dropdown.Item id="sms" type="checkbox">SMS</Dropdown.Item>
              <Dropdown.Item id="push" type="checkbox" defaultChecked>Push</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
        </Dropdown.Content>
      </Dropdown.Panel>
    </Dropdown>
  ),
};

export const CheckboxWithSelectAll = {
  args: {
    defaultOpen: false,
    defaultGroupExpanded: true,
  },
  render: ({ defaultOpen, defaultGroupExpanded }) => (
    <Dropdown defaultOpen={defaultOpen} defaultGroupExpanded={defaultGroupExpanded}>
      <Dropdown.Trigger>
        <button type="button" className="ho-demo-trigger">Select with Select All</button>
      </Dropdown.Trigger>
      <Dropdown.Panel>
        <Dropdown.Content>
          <Dropdown.Section>
            <Dropdown.Group label="Team Members" showSelectAll>
              <Dropdown.Item id="alice" type="checkbox">Alice</Dropdown.Item>
              <Dropdown.Item id="bob" type="checkbox">Bob</Dropdown.Item>
              <Dropdown.Item id="carol" type="checkbox">Carol</Dropdown.Item>
              <Dropdown.Item id="dave" type="checkbox">Dave</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
        </Dropdown.Content>
      </Dropdown.Panel>
    </Dropdown>
  ),
};

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

export const ItemsWithActions = {
  name: 'Items With Actions',
  args: {
    defaultOpen: false,
    defaultGroupExpanded: true,
  },
  render: ({ defaultOpen, defaultGroupExpanded }) => {
    const [activity, setActivity] = useState('Click an action button on the right.');

    function handleAction(verb, item) {
      setActivity(`${verb} → ${item.label} (${item.type})`);
    }

    return (
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <Dropdown defaultOpen={defaultOpen} defaultGroupExpanded={defaultGroupExpanded} hideOnSelection={false}>
          <Dropdown.Trigger>
            <button type="button" className="ho-demo-trigger">Manage Items</button>
          </Dropdown.Trigger>
          <Dropdown.Panel>
            <Dropdown.Content>
              <Dropdown.Section>
                <Dropdown.Group label="Quick Actions">
                  <Dropdown.Item
                    id="roadmap"
                    actions={item => <ItemActions onAction={verb => handleAction(verb, item)} />}
                  >
                    Roadmap
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="billing"
                    actions={item => <ItemActions onAction={verb => handleAction(verb, item)} />}
                  >
                    Billing
                  </Dropdown.Item>
                </Dropdown.Group>
                <Dropdown.Group label="Permissions">
                  <Dropdown.Item
                    id="view-reports"
                    type="checkbox"
                    defaultChecked
                    actions={item => <ItemActions onAction={verb => handleAction(verb, item)} />}
                  >
                    View Reports
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="manage-users"
                    type="checkbox"
                    actions={item => <ItemActions onAction={verb => handleAction(verb, item)} />}
                  >
                    Manage Users
                  </Dropdown.Item>
                </Dropdown.Group>
              </Dropdown.Section>
            </Dropdown.Content>
          </Dropdown.Panel>
        </Dropdown>

        <div style={{ width: 220, fontSize: 12, lineHeight: 1.5, color: '#334155' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Action output</div>
          <div style={{ padding: '10px 12px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            {activity}
          </div>
          <div style={{ marginTop: 10, color: '#64748b' }}>
            Action button clicks should not toggle checkbox state or select the item.
          </div>
        </div>
      </div>
    );
  },
};

function IconAll() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M3.33333 5.33335C4.06971 5.33335 4.66667 4.7364 4.66667 4.00002C4.66667 3.26364 4.06971 2.66669 3.33333 2.66669C2.59695 2.66669 2 3.26364 2 4.00002C2 4.7364 2.59695 5.33335 3.33333 5.33335ZM6 4.00002C6 3.63183 6.29848 3.33335 6.66667 3.33335H13.3333C13.7015 3.33335 14 3.63183 14 4.00002C14 4.36821 13.7015 4.66669 13.3333 4.66669H6.66667C6.29848 4.66669 6 4.36821 6 4.00002ZM6 8.00002C6 7.63183 6.29848 7.33335 6.66667 7.33335H13.3333C13.7015 7.33335 14 7.63183 14 8.00002C14 8.36821 13.7015 8.66669 13.3333 8.66669H6.66667C6.29848 8.66669 6 8.36821 6 8.00002ZM6.66667 11.3334C6.29848 11.3334 6 11.6318 6 12C6 12.3682 6.29848 12.6667 6.66667 12.6667H13.3333C13.7015 12.6667 14 12.3682 14 12C14 11.6318 13.7015 11.3334 13.3333 11.3334H6.66667ZM3.33333 9.33335C2.59695 9.33335 2 8.7364 2 8.00002C2 7.26364 2.59695 6.66669 3.33333 6.66669C4.06971 6.66669 4.66667 7.26364 4.66667 8.00002C4.66667 8.7364 4.06971 9.33335 3.33333 9.33335ZM2 12C2 12.7364 2.59695 13.3334 3.33333 13.3334C4.06971 13.3334 4.66667 12.7364 4.66667 12C4.66667 11.2636 4.06971 10.6667 3.33333 10.6667C2.59695 10.6667 2 11.2636 2 12Z" fill="currentColor" />
    </svg>
  );
}

function IconPermissions() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M8 1.33334C6.15905 1.33334 4.66667 2.82572 4.66667 4.66668C4.66667 6.50763 6.15905 8.00001 8 8.00001C9.84095 8.00001 11.3333 6.50763 11.3333 4.66668C11.3333 2.82572 9.84095 1.33334 8 1.33334ZM2 12.6667C2 10.8257 4.68629 9.33334 8 9.33334C11.3137 9.33334 14 10.8257 14 12.6667V14H2V12.6667Z" fill="currentColor" />
    </svg>
  );
}

function IconNotifications() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M8 1.33334C8 1.33334 8 1.33334 8 1.33334C5.05448 1.33334 2.66667 3.72115 2.66667 6.66668V10.6667L1.33333 12V12.6667H14.6667V12L13.3333 10.6667V6.66668C13.3333 3.72115 10.9455 1.33334 8 1.33334ZM8 14.6667C8.73638 14.6667 9.33333 14.0697 9.33333 13.3333H6.66667C6.66667 14.0697 7.26362 14.6667 8 14.6667Z" fill="currentColor" />
    </svg>
  );
}

function IconFeatures() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2L9.6 6.4H14L10.8 9.2L12 13.6L8 11.2L4 13.6L5.2 9.2L2 6.4H6.4L8 2Z" fill="currentColor" />
    </svg>
  );
}

export const ScrollSpyWithCheckbox = {
  name: 'Scroll Spy + Checkbox',
  args: {
    defaultOpen: false,
    defaultGroupExpanded: true,
  },
  argTypes: {
    hideOnSelection: { table: { disable: true } },
  },
  render: ({ defaultOpen, defaultGroupExpanded }) => (
    <Dropdown displayMode="scroll" defaultOpen={defaultOpen} defaultGroupExpanded={defaultGroupExpanded} hideOnSelection={false}>
      <Dropdown.Trigger>
        <button type="button" className="ho-demo-trigger">Configure Access</button>
      </Dropdown.Trigger>
      <Dropdown.Panel>
        <Dropdown.Navigation showAll allIcon={IconAll}>
          <Dropdown.NavigationItem id="permissions" icon={IconPermissions}>Permissions</Dropdown.NavigationItem>
          <Dropdown.NavigationItem id="notifications" icon={IconNotifications}>Notifications</Dropdown.NavigationItem>
          <Dropdown.NavigationItem id="features" icon={IconFeatures}>Features</Dropdown.NavigationItem>
        </Dropdown.Navigation>
        <Dropdown.Content>
          <Dropdown.Section forId="permissions" title="Permissions">
            <Dropdown.Group label="Data Access" showSelectAll>
              <Dropdown.Item id="perm-read" type="checkbox">Read</Dropdown.Item>
              <Dropdown.Item id="perm-write" type="checkbox">Write</Dropdown.Item>
              <Dropdown.Item id="perm-delete" type="checkbox">Delete</Dropdown.Item>
              <Dropdown.Item id="perm-export" type="checkbox">Export</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="User Management" showSelectAll>
              <Dropdown.Item id="perm-invite" type="checkbox">Invite Members</Dropdown.Item>
              <Dropdown.Item id="perm-remove" type="checkbox">Remove Members</Dropdown.Item>
              <Dropdown.Item id="perm-roles" type="checkbox">Manage Roles</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Billing" showSelectAll>
              <Dropdown.Item id="perm-view-billing" type="checkbox">View Billing</Dropdown.Item>
              <Dropdown.Item id="perm-manage-billing" type="checkbox">Manage Billing</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
          <Dropdown.Section forId="notifications" title="Notifications">
            <Dropdown.Group label="Channels" showSelectAll>
              <Dropdown.Item id="notif-email" type="checkbox" defaultChecked>Email</Dropdown.Item>
              <Dropdown.Item id="notif-sms" type="checkbox">SMS</Dropdown.Item>
              <Dropdown.Item id="notif-push" type="checkbox" defaultChecked>Push</Dropdown.Item>
              <Dropdown.Item id="notif-slack" type="checkbox">Slack</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Events" showSelectAll>
              <Dropdown.Item id="notif-signup" type="checkbox" defaultChecked>New Signup</Dropdown.Item>
              <Dropdown.Item id="notif-payment" type="checkbox" defaultChecked>Payment Received</Dropdown.Item>
              <Dropdown.Item id="notif-error" type="checkbox" defaultChecked>System Error</Dropdown.Item>
              <Dropdown.Item id="notif-report" type="checkbox">Weekly Report</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
          <Dropdown.Section forId="features" title="Features">
            <Dropdown.Group label="Beta Features" showSelectAll>
              <Dropdown.Item id="feat-ai" type="checkbox">AI Suggestions</Dropdown.Item>
              <Dropdown.Item id="feat-analytics" type="checkbox" defaultChecked>Advanced Analytics</Dropdown.Item>
              <Dropdown.Item id="feat-api-v2" type="checkbox">API v2</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Integrations" showSelectAll>
              <Dropdown.Item id="feat-zapier" type="checkbox" defaultChecked>Zapier</Dropdown.Item>
              <Dropdown.Item id="feat-hubspot" type="checkbox">HubSpot</Dropdown.Item>
              <Dropdown.Item id="feat-salesforce" type="checkbox">Salesforce</Dropdown.Item>
              <Dropdown.Item id="feat-stripe" type="checkbox" defaultChecked>Stripe</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
        </Dropdown.Content>
      </Dropdown.Panel>
    </Dropdown>
  ),
};
