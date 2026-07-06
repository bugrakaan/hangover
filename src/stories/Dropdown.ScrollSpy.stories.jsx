import { Dropdown } from '../components/Dropdown';

const AUTO_COLLAPSE_ARG_TYPE = {
  control: 'select',
  options: [false, true, 'auto'],
  description: 'Automatically collapse nav; "auto" expands on hover or keyboard focus',
};

export default {
  title: 'Dropdown/2. Scroll Spy',
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
    hideOnSelection: {
      control: 'boolean',
      description: 'Close panel when an item is selected',
    },
    collapsed: {
      control: 'boolean',
      description: 'Initial collapsed state of the navigation',
    },
    autoCollapse: AUTO_COLLAPSE_ARG_TYPE,
  },
};

function IconAll() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M3.33333 5.33335C4.06971 5.33335 4.66667 4.7364 4.66667 4.00002C4.66667 3.26364 4.06971 2.66669 3.33333 2.66669C2.59695 2.66669 2 3.26364 2 4.00002C2 4.7364 2.59695 5.33335 3.33333 5.33335ZM6 4.00002C6 3.63183 6.29848 3.33335 6.66667 3.33335H13.3333C13.7015 3.33335 14 3.63183 14 4.00002C14 4.36821 13.7015 4.66669 13.3333 4.66669H6.66667C6.29848 4.66669 6 4.36821 6 4.00002ZM6 8.00002C6 7.63183 6.29848 7.33335 6.66667 7.33335H13.3333C13.7015 7.33335 14 7.63183 14 8.00002C14 8.36821 13.7015 8.66669 13.3333 8.66669H6.66667C6.29848 8.66669 6 8.36821 6 8.00002ZM6.66667 11.3334C6.29848 11.3334 6 11.6318 6 12C6 12.3682 6.29848 12.6667 6.66667 12.6667H13.3333C13.7015 12.6667 14 12.3682 14 12C14 11.6318 13.7015 11.3334 13.3333 11.3334H6.66667ZM3.33333 9.33335C2.59695 9.33335 2 8.7364 2 8.00002C2 7.26364 2.59695 6.66669 3.33333 6.66669C4.06971 6.66669 4.66667 7.26364 4.66667 8.00002C4.66667 8.7364 4.06971 9.33335 3.33333 9.33335ZM2 12C2 12.7364 2.59695 13.3334 3.33333 13.3334C4.06971 13.3334 4.66667 12.7364 4.66667 12C4.66667 11.2636 4.06971 10.6667 3.33333 10.6667C2.59695 10.6667 2 11.2636 2 12Z" fill="currentColor" />
    </svg>
  );
}

function IconFruits() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M8 2C5.79086 2 4 3.79086 4 6C4 8.20914 5.79086 10 8 10C10.2091 10 12 8.20914 12 6C12 3.79086 10.2091 2 8 2ZM8 1C8 1 9 0 10.5 0.5C10.5 0.5 10 2 8 1ZM2.66667 11.3333C2.29848 11.3333 2 11.6318 2 12C2 12.3682 2.29848 12.6667 2.66667 12.6667H13.3333C13.7015 12.6667 14 12.3682 14 12C14 11.6318 13.7015 11.3333 13.3333 11.3333H2.66667Z" fill="currentColor" />
    </svg>
  );
}

function IconVegetables() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M8 1.33333C5.42267 1.33333 3.33333 3.42267 3.33333 6C3.33333 7.28533 3.856 8.44667 4.7 9.27867L4 14H12L11.3 9.27867C12.144 8.44667 12.6667 7.28533 12.6667 6C12.6667 3.42267 10.5773 1.33333 8 1.33333Z" fill="currentColor" />
    </svg>
  );
}

function IconDairy() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M5.33333 2H10.6667L12 5.33333V13.3333C12 13.7015 11.7015 14 11.3333 14H4.66667C4.29848 14 4 13.7015 4 13.3333V5.33333L5.33333 2ZM6.66667 3.33333L5.78133 5.33333H10.2187L9.33333 3.33333H6.66667Z" fill="currentColor" />
    </svg>
  );
}

function IconMeat() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M10.6667 2C9.196 2 8 3.196 8 4.66667C8 5.15333 8.13467 5.608 8.37067 6H4.66667C3.196 6 2 7.196 2 8.66667V11.3333C2 12.8053 3.196 14 4.66667 14H11.3333C12.8053 14 14 12.8053 14 11.3333V8.66667C14 7.52267 13.3227 6.54 12.352 6.10267C12.42 5.96533 12.4773 5.82133 12.52 5.67067C12.5987 5.40933 12.6387 5.13333 12.6387 4.85333C12.6387 3.29467 11.344 2 10.6667 2Z" fill="currentColor" />
    </svg>
  );
}

export const ScrollSpy = {
  name: 'Scroll Spy Mode',
  args: {
    defaultOpen: false,
    defaultGroupExpanded: true,
    hideOnSelection: true,
  },
  argTypes: {
    collapsed: { table: { disable: true } },
    autoCollapse: { table: { disable: true } },
  },
  render: ({ defaultOpen, defaultGroupExpanded, hideOnSelection }) => (
    <Dropdown displayMode="scroll" defaultOpen={defaultOpen} defaultGroupExpanded={defaultGroupExpanded} hideOnSelection={hideOnSelection}>
      <Dropdown.Trigger>
        <button type="button" className="ho-demo-trigger">Browse Categories</button>
      </Dropdown.Trigger>
      <Dropdown.Panel>
        <Dropdown.Navigation showAll allIcon={IconAll}>
          <Dropdown.NavigationItem id="fruits" icon={IconFruits}>Fruits</Dropdown.NavigationItem>
          <Dropdown.NavigationItem id="vegetables" icon={IconVegetables}>Vegetables</Dropdown.NavigationItem>
          <Dropdown.NavigationItem id="dairy" icon={IconDairy}>Dairy</Dropdown.NavigationItem>
          <Dropdown.NavigationItem id="meat" icon={IconMeat}>Meat</Dropdown.NavigationItem>
        </Dropdown.Navigation>
        <Dropdown.Content>
          <Dropdown.Section forId="fruits" title="Fruits">
            <Dropdown.Group label="Citrus">
              <Dropdown.Item id="orange">Orange</Dropdown.Item>
              <Dropdown.Item id="lemon">Lemon</Dropdown.Item>
              <Dropdown.Item id="grapefruit">Grapefruit</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Tropical">
              <Dropdown.Item id="mango">Mango</Dropdown.Item>
              <Dropdown.Item id="pineapple">Pineapple</Dropdown.Item>
              <Dropdown.Item id="papaya">Papaya</Dropdown.Item>
              <Dropdown.Item id="guava">Guava</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Berries">
              <Dropdown.Item id="strawberry">Strawberry</Dropdown.Item>
              <Dropdown.Item id="blueberry">Blueberry</Dropdown.Item>
              <Dropdown.Item id="raspberry">Raspberry</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
          <Dropdown.Section forId="vegetables" title="Vegetables">
            <Dropdown.Group label="Leafy Greens">
              <Dropdown.Item id="spinach">Spinach</Dropdown.Item>
              <Dropdown.Item id="kale">Kale</Dropdown.Item>
              <Dropdown.Item id="arugula">Arugula</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Root Vegetables">
              <Dropdown.Item id="carrot">Carrot</Dropdown.Item>
              <Dropdown.Item id="beet">Beet</Dropdown.Item>
              <Dropdown.Item id="parsnip">Parsnip</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
          <Dropdown.Section forId="dairy" title="Dairy">
            <Dropdown.Group label="Cheese">
              <Dropdown.Item id="cheddar">Cheddar</Dropdown.Item>
              <Dropdown.Item id="brie">Brie</Dropdown.Item>
              <Dropdown.Item id="gouda">Gouda</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Milk & Cream">
              <Dropdown.Item id="whole-milk">Whole Milk</Dropdown.Item>
              <Dropdown.Item id="heavy-cream">Heavy Cream</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
          <Dropdown.Section forId="meat" title="Meat">
            <Dropdown.Group label="Poultry">
              <Dropdown.Item id="chicken">Chicken</Dropdown.Item>
              <Dropdown.Item id="turkey">Turkey</Dropdown.Item>
              <Dropdown.Item id="duck">Duck</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Red Meat">
              <Dropdown.Item id="beef">Beef</Dropdown.Item>
              <Dropdown.Item id="pork">Pork</Dropdown.Item>
              <Dropdown.Item id="lamb">Lamb</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
        </Dropdown.Content>
      </Dropdown.Panel>
    </Dropdown>
  ),
};

function IconForms() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M4 0.666687H12C13.1046 0.666687 14 1.56212 14 2.66669V13.3334C14 14.4379 13.1046 15.3334 12 15.3334H4C2.89543 15.3334 2 14.4379 2 13.3334V2.66669C2 1.56212 2.89543 0.666687 4 0.666687ZM5 4.00002C4.44772 4.00002 4 4.44774 4 5.00002C4 5.55231 4.44772 6.00002 5 6.00002H11C11.5523 6.00002 12 5.55231 12 5.00002C12 4.44774 11.5523 4.00002 11 4.00002H5ZM5 7.33335C4.44772 7.33335 4 7.78107 4 8.33335C4 8.88564 4.44772 9.33335 5 9.33335H11C11.5523 9.33335 12 8.88564 12 8.33335C12 7.78107 11.5523 7.33335 11 7.33335H5ZM4 11.6667C4 11.1144 4.44772 10.6667 5 10.6667H11C11.5523 10.6667 12 11.1144 12 11.6667C12 12.219 11.5523 12.6667 11 12.6667H5C4.44772 12.6667 4 12.219 4 11.6667Z" fill="currentColor" />
    </svg>
  );
}

function IconAI() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M12.5 1.5L13.1 3.4L15 4L13.1 4.6L12.5 6.5L11.9 4.6L10 4L11.9 3.4L12.5 1.5Z" fill="currentColor" />
      <path d="M7 5L8 8L11 9L8 10L7 13L6 10L3 9L6 8L7 5Z" fill="currentColor" />
      <path d="M3 2L3.4 3.1L4.5 3.5L3.4 3.9L3 5L2.6 3.9L1.5 3.5L2.6 3.1L3 2Z" fill="currentColor" />
    </svg>
  );
}

function IconPayment() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M0.666672 4.66669C0.666672 3.56212 1.5621 2.66669 2.66667 2.66669H13.3333C14.4379 2.66669 15.3333 3.56212 15.3333 4.66669V6.66669V11.3334C15.3333 12.4379 14.4379 13.3334 13.3333 13.3334H2.66667C1.5621 13.3334 0.666672 12.4379 0.666672 11.3334V6.66669V4.66669ZM14 7.33335H2.00001V11.3334C2.00001 11.7015 2.29848 12 2.66667 12H13.3333C13.7015 12 14 11.7015 14 11.3334V7.33335ZM4.00001 8.66669C3.63182 8.66669 3.33334 8.96516 3.33334 9.33335C3.33334 9.70154 3.63182 10 4.00001 10H7.33334C7.70153 10 8.00001 9.70154 8.00001 9.33335C8.00001 8.96516 7.70153 8.66669 7.33334 8.66669H4.00001ZM10.6667 9.33335C10.6667 8.96516 10.9651 8.66669 11.3333 8.66669H12C12.3682 8.66669 12.6667 8.96516 12.6667 9.33335V10C12.6667 10.3682 12.3682 10.6667 12 10.6667H11.3333C10.9651 10.6667 10.6667 10.3682 10.6667 10V9.33335Z" fill="currentColor" />
    </svg>
  );
}

function IconWebhooks() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M9.63667 1.7627C9.12179 1.47254 8.53903 1.32449 7.94809 1.33372C7.35716 1.34295 6.7793 1.50913 6.27374 1.81522C5.76817 2.12132 5.35308 2.55633 5.071 3.07567C4.78891 3.59502 4.64998 4.18002 4.66844 4.77074C4.68689 5.36146 4.86207 5.93665 5.17603 6.43737C5.37362 6.7525 5.6217 7.03101 5.909 7.26246L4.57339 10.0032C3.88053 10.0511 3.33333 10.6283 3.33333 11.3333C3.33333 12.0697 3.93028 12.6666 4.66666 12.6666C5.40304 12.6666 5.99999 12.0697 5.99999 11.3333C5.99999 11.057 5.91592 10.8002 5.77195 10.5873L7.36341 7.3216C7.52146 6.99727 7.39282 6.60606 7.07312 6.43883C6.75891 6.27446 6.49405 6.02952 6.30568 5.72908C6.1173 5.42865 6.0122 5.08353 6.00112 4.7291C5.99005 4.37467 6.07341 4.02367 6.24266 3.71206C6.41191 3.40045 6.66096 3.13945 6.9643 2.95579C7.26764 2.77213 7.61435 2.67243 7.96891 2.66689C8.32348 2.66135 8.67313 2.75018 8.98206 2.92428C9.29099 3.09837 9.54807 3.35147 9.72697 3.65764C9.90587 3.96381 10.0001 4.31204 10.0001 4.66665C10.0001 5.03484 10.2986 5.33331 10.6668 5.33331C11.035 5.33331 11.3335 5.03484 11.3335 4.66665C11.3335 4.07564 11.1763 3.49526 10.8782 2.98498C10.58 2.47469 10.1515 2.05286 9.63667 1.7627ZM9.11262 5.40165C9.2521 5.19093 9.33333 4.93827 9.33333 4.66665C9.33333 3.93027 8.73637 3.33331 7.99999 3.33331C7.26361 3.33331 6.66666 3.93027 6.66666 4.66665C6.66666 5.37613 7.2208 5.95619 7.91989 5.99761L9.54327 9.24685C9.62234 9.40511 9.76108 9.52545 9.92892 9.58137C10.0968 9.63729 10.28 9.6242 10.4382 9.54499C10.7552 9.38621 11.1088 9.31459 11.4627 9.33746C11.8166 9.36034 12.158 9.47689 12.452 9.67516C12.746 9.87344 12.982 10.1463 13.1358 10.4658C13.2896 10.7854 13.3556 11.14 13.3272 11.4935C13.2988 11.847 13.177 12.1865 12.9741 12.4774C12.7713 12.7682 12.4947 12.9999 12.1729 13.1487C11.851 13.2975 11.4953 13.358 11.1423 13.3241C10.7894 13.2902 10.4517 13.163 10.1641 12.9557C9.86542 12.7404 9.44875 12.8079 9.23344 13.1066C9.01813 13.4053 9.0857 13.8219 9.38437 14.0372C9.86379 14.3829 10.4265 14.5948 11.0148 14.6513C11.6031 14.7079 12.1958 14.607 12.7323 14.359C13.2688 14.111 13.7297 13.7249 14.0678 13.2401C14.4058 12.7553 14.609 12.1894 14.6563 11.6003C14.7036 11.0112 14.5935 10.4201 14.3371 9.88754C14.0808 9.35501 13.6875 8.90021 13.1975 8.56974C12.7075 8.23928 12.1385 8.04503 11.5487 8.00691C11.1835 7.9833 10.8185 8.02008 10.4679 8.11435L9.11262 5.40165ZM12.6667 11.3333C12.6667 12.0697 12.0697 12.6666 11.3333 12.6666C10.841 12.6666 10.4111 12.3999 10.1801 12.003H7.93204C7.85904 12.3589 7.72802 12.7021 7.54283 13.0182C7.24409 13.5282 6.81515 13.9495 6.29994 14.2391C5.78474 14.5287 5.2018 14.6761 4.61088 14.6662C4.01995 14.6563 3.44227 14.4895 2.93705 14.1828C2.43182 13.8762 2.01722 13.4407 1.73572 12.921C1.45422 12.4013 1.31595 11.8162 1.33507 11.2255C1.3542 10.6348 1.53003 10.0598 1.84456 9.55941C2.15909 9.05904 2.60099 8.65129 3.12499 8.37795C3.45144 8.20766 3.85412 8.33425 4.02441 8.6607C4.1947 8.98714 4.06811 9.38982 3.74166 9.56011C3.42726 9.72411 3.16212 9.96876 2.9734 10.269C2.78469 10.5692 2.67918 10.9142 2.66771 11.2686C2.65623 11.623 2.7392 11.9741 2.9081 12.2859C3.077 12.5977 3.32576 12.859 3.62889 13.043C3.93203 13.227 4.27863 13.3271 4.63319 13.3331C4.98775 13.339 5.33751 13.2506 5.64663 13.0768C5.95575 12.9031 6.21312 12.6502 6.39236 12.3443C6.5716 12.0383 6.66627 11.6902 6.66666 11.3356C6.66707 10.9677 6.96543 10.6696 7.33333 10.6696H10.1766C10.4068 10.2695 10.8386 9.99998 11.3333 9.99998C12.0697 9.99998 12.6667 10.5969 12.6667 11.3333Z" fill="currentColor" />
    </svg>
  );
}

function IconEmpty() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.25" strokeDasharray="3 2" fill="none" />
      <circle cx="8" cy="8" r="1.25" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

const ProductionMode = {
  name: 'Production Mode',
  args: {
    defaultOpen: false,
    defaultGroupExpanded: true,
    hideOnSelection: true,
    placement: 'bottom-end',
    collapsed: false,
    autoCollapse: true,
    darkMode: false,
  },
  argTypes: {
    placement: {
      control: 'select',
      options: ['bottom-start', 'bottom', 'bottom-end', 'top-start', 'top', 'top-end', 'left', 'right'],
      description: 'Panel placement relative to trigger',
    },
    collapsed: { control: 'boolean', description: 'Initial collapsed state' },
    autoCollapse: AUTO_COLLAPSE_ARG_TYPE,
    darkMode: { control: 'boolean', description: 'Dark mode' },
  },
  decorators: [
    (Story, context) => (
      <>
        <style>{`:root { --hangover-font-family: 'Circular', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }`}</style>
        <div style={context.args.darkMode ? { background: '#12141f', padding: '24px', borderRadius: '8px', display: 'inline-block' } : {}}>
          <Story />
        </div>
      </>
    ),
  ],
  render: ({ defaultOpen, defaultGroupExpanded, hideOnSelection, placement, collapsed, autoCollapse, darkMode }) => (
    <Dropdown displayMode="scroll" defaultOpen={defaultOpen} defaultGroupExpanded={defaultGroupExpanded} hideOnSelection={hideOnSelection} darkMode={darkMode}>
      <Dropdown.Trigger>
        <button type="button" className="ho-demo-trigger">Select Field</button>
      </Dropdown.Trigger>
      <Dropdown.Panel placement={placement}>
        <Dropdown.Navigation showAll allIcon={IconAll} collapsed={collapsed} autoCollapse={autoCollapse}>
          <Dropdown.NavigationItem id="forms" icon={IconForms}>Forms</Dropdown.NavigationItem>
          <Dropdown.NavigationItem id="ai-outputs" icon={IconAI}>AI Elements</Dropdown.NavigationItem>
          <Dropdown.NavigationItem id="payment-outputs" icon={IconPayment}>Payment</Dropdown.NavigationItem>
          <Dropdown.NavigationItem id="webhooks" icon={IconWebhooks}>Webhooks</Dropdown.NavigationItem>
          <Dropdown.NavigationItem id="empty" icon={IconEmpty}>Empty</Dropdown.NavigationItem>
        </Dropdown.Navigation>
        <Dropdown.Content>
          <Dropdown.Section forId="forms" title="Forms">
            <Dropdown.Group label="Contact Form">
              <Dropdown.Item id="form-first-name">First Name</Dropdown.Item>
              <Dropdown.Item id="form-last-name">Last Name</Dropdown.Item>
              <Dropdown.Item id="form-email">Email Address</Dropdown.Item>
              <Dropdown.Item id="form-phone">Phone Number</Dropdown.Item>
              <Dropdown.Item id="form-message">Message</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Registration Form">
              <Dropdown.Item id="form-username">Username</Dropdown.Item>
              <Dropdown.Item id="form-password">Password</Dropdown.Item>
              <Dropdown.Item id="form-confirm-password">Confirm Password</Dropdown.Item>
              <Dropdown.Item id="form-company">Company Name</Dropdown.Item>
              <Dropdown.Item id="form-role">Job Role</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Survey Form">
              <Dropdown.Item id="form-rating">Satisfaction Rating</Dropdown.Item>
              <Dropdown.Item id="form-nps">NPS Score</Dropdown.Item>
              <Dropdown.Item id="form-feedback">Feedback Text</Dropdown.Item>
              <Dropdown.Item id="form-source">How Did You Hear</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
          <Dropdown.Section forId="ai-outputs" title="AI Elements">
            <Dropdown.Group label="Text Generation">
              <Dropdown.Item id="ai-summary">Summary</Dropdown.Item>
              <Dropdown.Item id="ai-subject">Email Subject</Dropdown.Item>
              <Dropdown.Item id="ai-body">Email Body</Dropdown.Item>
              <Dropdown.Item id="ai-headline">Headline</Dropdown.Item>
              <Dropdown.Item id="ai-cta">Call to Action</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Classification">
              <Dropdown.Item id="ai-sentiment">Sentiment</Dropdown.Item>
              <Dropdown.Item id="ai-intent">Intent</Dropdown.Item>
              <Dropdown.Item id="ai-category">Category</Dropdown.Item>
              <Dropdown.Item id="ai-priority">Priority Score</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Extraction">
              <Dropdown.Item id="ai-keywords">Keywords</Dropdown.Item>
              <Dropdown.Item id="ai-entities">Named Entities</Dropdown.Item>
              <Dropdown.Item id="ai-language">Detected Language</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
          <Dropdown.Section forId="payment-outputs" title="Payment">
            <Dropdown.Group label="Transaction">
              <Dropdown.Item id="pay-id">Transaction ID</Dropdown.Item>
              <Dropdown.Item id="pay-status">Payment Status</Dropdown.Item>
              <Dropdown.Item id="pay-amount">Amount</Dropdown.Item>
              <Dropdown.Item id="pay-currency">Currency</Dropdown.Item>
              <Dropdown.Item id="pay-date">Payment Date</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Customer">
              <Dropdown.Item id="pay-customer-id">Customer ID</Dropdown.Item>
              <Dropdown.Item id="pay-customer-email">Customer Email</Dropdown.Item>
              <Dropdown.Item id="pay-billing-name">Billing Name</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Card Details">
              <Dropdown.Item id="pay-card-brand">Card Brand</Dropdown.Item>
              <Dropdown.Item id="pay-card-last4">Last 4 Digits</Dropdown.Item>
              <Dropdown.Item id="pay-card-exp">Expiry Date</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
          <Dropdown.Section forId="webhooks" title="Webhooks">
            <Dropdown.Group label="Request">
              <Dropdown.Item id="wh-event">Event Type</Dropdown.Item>
              <Dropdown.Item id="wh-timestamp">Timestamp</Dropdown.Item>
              <Dropdown.Item id="wh-source">Source</Dropdown.Item>
              <Dropdown.Item id="wh-signature">Signature</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Response">
              <Dropdown.Item id="wh-status-code">Status Code</Dropdown.Item>
              <Dropdown.Item id="wh-response-time">Response Time (ms)</Dropdown.Item>
              <Dropdown.Item id="wh-retry-count">Retry Count</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Metadata">
              <Dropdown.Item id="wh-endpoint">Endpoint URL</Dropdown.Item>
              <Dropdown.Item id="wh-created-at">Created At</Dropdown.Item>
              <Dropdown.Item id="wh-last-triggered">Last Triggered</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
          <Dropdown.Section forId="empty" title="Empty">
            <Dropdown.Group label="Pending Results" color="#e91e8c" />
            <Dropdown.Group label="Archived Fields" color="#e53935" />
            <Dropdown.Group label="Disabled Outputs" color="#7cb342" />
          </Dropdown.Section>
        </Dropdown.Content>
      </Dropdown.Panel>
    </Dropdown>
  ),
};

// ── Small icon helpers for the Icons story ────
function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M8 2a2.667 2.667 0 1 1 0 5.333A2.667 2.667 0 0 1 8 2Zm0 6.667c-3.2 0-5.333 1.6-5.333 2.666V12h10.666v-.667C13.333 10.267 11.2 8.667 8 8.667Z" fill="currentColor" />
    </svg>
  );
}
function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M2 3.333A.667.667 0 0 1 2.667 2.667h10.666A.667.667 0 0 1 14 3.333v9.334a.667.667 0 0 1-.667.666H2.667A.667.667 0 0 1 2 12.667V3.333Zm1.333.92V12h9.334V4.253L8 7.92 3.333 4.253ZM12.24 4H3.76L8 6.747 12.24 4Z" fill="currentColor" />
    </svg>
  );
}
function IconPhone() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M3.333 2h2.334l1 2.667-1.334 1A7.355 7.355 0 0 0 8.333 8.667l1-1.334L12 8.333v2.334c0 1.386-3.245 2.916-5.333.666C4.12 8.52 2.147 5.253 3.333 2Z" fill="currentColor" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M8 1.333A3.333 3.333 0 0 0 4.667 4.667V6H4a.667.667 0 0 0-.667.667v6.666c0 .369.299.667.667.667h8a.667.667 0 0 0 .667-.667V6.667A.667.667 0 0 0 12 6h-.667V4.667A3.333 3.333 0 0 0 8 1.333Zm2 4.667V4.667a2 2 0 1 0-4 0V6h4Zm-2 2a1 1 0 0 1 .667 1.747V11.333a.667.667 0 1 1-1.334 0V9.08A1 1 0 0 1 8 8Z" fill="currentColor" />
    </svg>
  );
}
function IconTag() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M2 2.667A.667.667 0 0 1 2.667 2H8a.667.667 0 0 1 .471.195l5.334 5.333a.667.667 0 0 1 0 .944l-4 4a.667.667 0 0 1-.943 0L3.527 7.138A.667.667 0 0 1 3.333 6.667V4a2 2 0 0 0-1.333-.003V2.667ZM5 4.667a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor" />
    </svg>
  );
}
function IconStar() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1.333 9.9 5.88l4.767.44-3.6 3.12 1.067 4.667L8 11.573l-4.134 2.534 1.067-4.667-3.6-3.12 4.767-.44L8 1.333Z" fill="currentColor" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M2 12.667h12V14H2v-1.333ZM3.333 8h1.334v4H3.333V8Zm2.667-2.667H7.333V12H6V5.333Zm2.667-3.333h1.333V12H8.667V2Zm2.666 2h1.334V12h-1.334V4Z" fill="currentColor" />
    </svg>
  );
}
function IconBolt() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M9.333 1.333 3.333 9.333h5.334L7.333 14.667 13.333 6.667H8L9.333 1.333Z" fill="currentColor" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M8 1.333a6.667 6.667 0 1 0 0 13.334A6.667 6.667 0 0 0 8 1.333ZM8 4a.667.667 0 0 1 .667.667V7.72l2.276 1.365a.667.667 0 0 1-.686 1.143L7.59 8.638A.667.667 0 0 1 7.333 8.1V4.667A.667.667 0 0 1 8 4Z" fill="currentColor" />
    </svg>
  );
}
function IconCard() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M1.333 4.667A.667.667 0 0 1 2 4h12a.667.667 0 0 1 .667.667v6.666A.667.667 0 0 1 14 12H2a.667.667 0 0 1-.667-.667V4.667Zm1.334.666V6.667h10.666V5.333H2.667ZM2.667 8v2.667h10.666V8H2.667Zm0 0" fill="currentColor" />
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M8 1.333a6.667 6.667 0 1 0 0 13.334A6.667 6.667 0 0 0 8 1.333ZM5.333 8c0 .493.034.973.1 1.434A8.624 8.624 0 0 0 8 9.667c.878 0 1.71-.113 2.567-.233.066-.46.1-.94.1-1.434 0-.493-.034-.973-.1-1.433A8.622 8.622 0 0 0 8 6.333c-.878 0-1.71.113-2.567.234A9.038 9.038 0 0 0 5.333 8Zm1.48-3.02C7.156 4.908 7.572 4.667 8 4.667s.844.24 1.187.313a8.3 8.3 0 0 1 2.12 1.253A10.3 10.3 0 0 1 11.42 8a10.3 10.3 0 0 1-.113 1.767 8.301 8.301 0 0 1-2.12 1.253C8.844 11.093 8.428 11.333 8 11.333s-.844-.24-1.187-.313a8.3 8.3 0 0 1-2.12-1.253A10.3 10.3 0 0 1 4.58 8c.02-.607.06-1.2.113-1.767a8.3 8.3 0 0 1 2.12-1.253Z" fill="currentColor" />
    </svg>
  );
}
function IconKey() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M10 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2.667 4a2.667 2.667 0 1 1 5.334 0 2.667 2.667 0 0 1-5.334 0Zm-1.1 1.733L2 12l.667 1.333L4 14l.667-1.333L5.333 14 6 13.333l-.667-1.333h1.334L7.333 10.8A5.37 5.37 0 0 1 6.233 7.733Z" fill="currentColor" />
    </svg>
  );
}
function IconHash() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M6.667 2a.667.667 0 0 0-1.334 0v1.333H2.667a.667.667 0 0 0 0 1.334H5.333v2.666H2.667a.667.667 0 1 0 0 1.334H5.333V14a.667.667 0 1 0 1.334 0v-1.333h2.666V14a.667.667 0 1 0 1.334 0v-1.333h2.666a.667.667 0 1 0 0-1.334H10.667V9.333h2.666a.667.667 0 1 0 0-1.334H10.667V5.333h2.666a.667.667 0 0 0 0-1.334H10.667V2a.667.667 0 0 0-1.334 0v1.333H6.667V2Zm0 3.333v2.667H9.333V5.333H6.667Zm0 5.334V8h2.666v2.667H6.667Z" fill="currentColor" />
    </svg>
  );
}

const ProductionModeIcons = {
  name: 'Production Mode (Icons)',
  args: {
    defaultOpen: false,
    defaultGroupExpanded: true,
    hideOnSelection: true,
    placement: 'bottom-end',
    collapsed: false,
    autoCollapse: true,
    darkMode: false,
  },
  argTypes: {
    placement: {
      control: 'select',
      options: ['bottom-start', 'bottom', 'bottom-end', 'top-start', 'top', 'top-end', 'left', 'right'],
      description: 'Panel placement relative to trigger',
    },
    collapsed: { control: 'boolean', description: 'Initial collapsed state' },
    autoCollapse: AUTO_COLLAPSE_ARG_TYPE,
    darkMode: { control: 'boolean', description: 'Dark mode' },
  },
  decorators: [
    (Story, context) => (
      <>
        <style>{`:root { --hangover-font-family: 'Circular', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }`}</style>
        <div style={context.args.darkMode ? { background: '#12141f', padding: '24px', borderRadius: '8px', display: 'inline-block' } : {}}>
          <Story />
        </div>
      </>
    ),
  ],
  render: ({ defaultOpen, defaultGroupExpanded, hideOnSelection, placement, collapsed, autoCollapse, darkMode }) => (
    <Dropdown displayMode="scroll" defaultOpen={defaultOpen} defaultGroupExpanded={defaultGroupExpanded} hideOnSelection={hideOnSelection} darkMode={darkMode}>
      <Dropdown.Trigger>
        <button type="button" className="ho-demo-trigger">Select Field</button>
      </Dropdown.Trigger>
      <Dropdown.Panel placement={placement}>
        <Dropdown.Navigation showAll allIcon={IconAll} collapsed={collapsed} autoCollapse={autoCollapse}>
          <Dropdown.NavigationItem id="forms" icon={IconForms}>Forms</Dropdown.NavigationItem>
          <Dropdown.NavigationItem id="ai-outputs" icon={IconAI}>AI Elements</Dropdown.NavigationItem>
          <Dropdown.NavigationItem id="payment-outputs" icon={IconPayment}>Payment</Dropdown.NavigationItem>
          <Dropdown.NavigationItem id="webhooks" icon={IconWebhooks}>Webhooks</Dropdown.NavigationItem>
        </Dropdown.Navigation>
        <Dropdown.Content>
          <Dropdown.Section forId="forms" title="Forms">
            <Dropdown.Group label="Contact Form" icon={IconUser}>
              <Dropdown.Item id="form-first-name" icon={IconUser}>First Name</Dropdown.Item>
              <Dropdown.Item id="form-last-name" icon={IconUser}>Last Name</Dropdown.Item>
              <Dropdown.Item id="form-email" icon={IconMail}>Email Address</Dropdown.Item>
              <Dropdown.Item id="form-phone" icon={IconPhone}>Phone Number</Dropdown.Item>
              <Dropdown.Item id="form-message" icon={IconTag}>Message</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Customer Personal and Registration Details Form" icon={IconLock}>
              <Dropdown.Item id="form-username" icon={IconUser}>Username</Dropdown.Item>
              <Dropdown.Item id="form-password" icon={IconLock}>Password (min. 8 characters, at least one uppercase)</Dropdown.Item>
              <Dropdown.Item id="form-confirm-password" icon={IconLock}>Confirm Password</Dropdown.Item>
              <Dropdown.Item id="form-company" icon={IconTag}>Company or Organization Name</Dropdown.Item>
              <Dropdown.Item id="form-role" icon={IconTag}>Job Role / Position Title</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Survey Form" icon={IconStar}>
              <Dropdown.Item id="form-rating" icon={IconStar}>Overall Satisfaction Rating (1–10)</Dropdown.Item>
              <Dropdown.Item id="form-nps" icon={IconChart}>Net Promoter Score (NPS)</Dropdown.Item>
              <Dropdown.Item id="form-feedback" icon={IconTag}>Open-ended Feedback and Suggestions Text</Dropdown.Item>
              <Dropdown.Item id="form-source" icon={IconGlobe}>How Did You Hear About Us</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
          <Dropdown.Section forId="ai-outputs" title="AI Elements">
            <Dropdown.Group label="Automated Text Generation Output Fields" icon={IconBolt}>
              <Dropdown.Item id="ai-summary" icon={IconTag}>AI-Generated Executive Summary</Dropdown.Item>
              <Dropdown.Item id="ai-subject" icon={IconMail}>Email Subject Line (A/B Tested)</Dropdown.Item>
              <Dropdown.Item id="ai-body" icon={IconMail}>Email Body</Dropdown.Item>
              <Dropdown.Item id="ai-headline" icon={IconBolt}>Headline</Dropdown.Item>
              <Dropdown.Item id="ai-cta" icon={IconBolt}>Call to Action</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Classification" icon={IconTag}>
              <Dropdown.Item id="ai-sentiment" icon={IconStar}>Sentiment</Dropdown.Item>
              <Dropdown.Item id="ai-intent" icon={IconBolt}>Predicted User Intent Category</Dropdown.Item>
              <Dropdown.Item id="ai-category" icon={IconTag}>Category</Dropdown.Item>
              <Dropdown.Item id="ai-priority" icon={IconChart}>Automated Priority Score (0–100)</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Extraction" icon={IconKey}>
              <Dropdown.Item id="ai-keywords" icon={IconKey}>Keywords</Dropdown.Item>
              <Dropdown.Item id="ai-entities" icon={IconHash}>Named Entities and Proper Nouns</Dropdown.Item>
              <Dropdown.Item id="ai-language" icon={IconGlobe}>Detected Language</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
          <Dropdown.Section forId="payment-outputs" title="Payment">
            <Dropdown.Group label="Transaction" icon={IconCard}>
              <Dropdown.Item id="pay-id" icon={IconHash}>Unique Transaction Identifier (UUID)</Dropdown.Item>
              <Dropdown.Item id="pay-status" icon={IconBolt}>Payment Status</Dropdown.Item>
              <Dropdown.Item id="pay-amount" icon={IconChart}>Charged Amount (with tax)</Dropdown.Item>
              <Dropdown.Item id="pay-currency" icon={IconGlobe}>Currency</Dropdown.Item>
              <Dropdown.Item id="pay-date" icon={IconClock}>Payment Date and Time (UTC)</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Customer Billing and Account Information" icon={IconUser}>
              <Dropdown.Item id="pay-customer-id" icon={IconHash}>Customer ID</Dropdown.Item>
              <Dropdown.Item id="pay-customer-email" icon={IconMail}>Customer Email</Dropdown.Item>
              <Dropdown.Item id="pay-billing-name" icon={IconUser}>Billing Name</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Card Details" icon={IconCard}>
              <Dropdown.Item id="pay-card-brand" icon={IconCard}>Card Brand</Dropdown.Item>
              <Dropdown.Item id="pay-card-last4" icon={IconHash}>Last 4 Digits</Dropdown.Item>
              <Dropdown.Item id="pay-card-exp" icon={IconClock}>Expiry Date</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
          <Dropdown.Section forId="webhooks" title="Webhooks">
            <Dropdown.Group label="Incoming Request Headers and Payload" icon={IconGlobe}>
              <Dropdown.Item id="wh-event" icon={IconBolt}>Event Type</Dropdown.Item>
              <Dropdown.Item id="wh-timestamp" icon={IconClock}>Event Timestamp (ISO 8601)</Dropdown.Item>
              <Dropdown.Item id="wh-source" icon={IconGlobe}>Source Application or Service Name</Dropdown.Item>
              <Dropdown.Item id="wh-signature" icon={IconKey}>HMAC-SHA256 Request Signature</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Response" icon={IconChart}>
              <Dropdown.Item id="wh-status-code" icon={IconHash}>HTTP Status Code</Dropdown.Item>
              <Dropdown.Item id="wh-response-time" icon={IconClock}>End-to-end Response Time (ms)</Dropdown.Item>
              <Dropdown.Item id="wh-retry-count" icon={IconChart}>Retry Count</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Metadata" icon={IconTag}>
              <Dropdown.Item id="wh-endpoint" icon={IconGlobe}>Target Endpoint URL</Dropdown.Item>
              <Dropdown.Item id="wh-created-at" icon={IconClock}>Created At</Dropdown.Item>
              <Dropdown.Item id="wh-last-triggered" icon={IconClock}>Last Successfully Triggered At</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
        </Dropdown.Content>
      </Dropdown.Panel>
    </Dropdown>
  ),
};

export const LongTextContent = {
  name: 'Long Text Content',
  args: {
    defaultOpen: true,
    defaultGroupExpanded: true,
    hideOnSelection: false,
    autoCollapse: true,
    placement: 'bottom-end',
  },
  argTypes: {
    collapsed: { table: { disable: true } },
    autoCollapse: AUTO_COLLAPSE_ARG_TYPE,
    placement: {
      control: 'select',
      options: ['bottom-start', 'bottom', 'bottom-end', 'top-start', 'top', 'top-end'],
      description: 'Panel placement relative to trigger',
    },
  },
  decorators: [
    (Story) => (
      <>
        <style>{`:root { --hangover-font-family: 'Circular', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }`}</style>
        <Story />
      </>
    ),
  ],
  render: ({ defaultOpen, defaultGroupExpanded, hideOnSelection, autoCollapse, placement }) => (
    <Dropdown displayMode="scroll" defaultOpen={defaultOpen} defaultGroupExpanded={defaultGroupExpanded} hideOnSelection={hideOnSelection}>
      <Dropdown.Trigger>
        <button type="button" className="ho-demo-trigger">Select Field</button>
      </Dropdown.Trigger>
      <Dropdown.Panel placement={placement}>
        <Dropdown.Navigation showAll allIcon={IconAll} autoCollapse={autoCollapse}>
          <Dropdown.NavigationItem id="forms" icon={IconForms}>Forms</Dropdown.NavigationItem>
          <Dropdown.NavigationItem id="ai-outputs" icon={IconAI}>AI Elements</Dropdown.NavigationItem>
          <Dropdown.NavigationItem id="payment-outputs" icon={IconPayment}>Payment</Dropdown.NavigationItem>
          <Dropdown.NavigationItem id="webhooks" icon={IconWebhooks}>Webhooks</Dropdown.NavigationItem>
        </Dropdown.Navigation>
        <Dropdown.Content>
          <Dropdown.Section forId="forms" title="Forms">
            <Dropdown.Group label="Customer Personal and Contact Information Collection Form Fields">
              <Dropdown.Item id="lt-form-first-name">Legal First Name Exactly as It Appears on a Valid Government-Issued Photo Identification Document</Dropdown.Item>
              <Dropdown.Item id="lt-form-last-name">Legal Last Name / Family Name Exactly as It Appears on a Valid Government-Issued Photo Identification Document</Dropdown.Item>
              <Dropdown.Item id="lt-form-email">Primary Business or Professional Email Address Used for All Official Correspondence and Notifications</Dropdown.Item>
              <Dropdown.Item id="lt-form-phone">Mobile or Work Phone Number Including Full International Country Dialing Prefix Code</Dropdown.Item>
              <Dropdown.Item id="lt-form-message">Detailed Description of Support Request, Product Inquiry, or Customer Service Issue Being Submitted</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Company Legal Registration, Tax and Billing Address Details for Invoice Generation">
              <Dropdown.Item id="lt-form-company">Full Official Legal Company, Organization, or Business Entity Name as Registered</Dropdown.Item>
              <Dropdown.Item id="lt-form-vat">VAT Registration Number or Tax Identification Number Required for European Union Cross-Border Transactions</Dropdown.Item>
              <Dropdown.Item id="lt-form-billing">Complete Registered Billing Address Including Street, City, Postal or ZIP Code, and Country of Incorporation</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
          <Dropdown.Section forId="ai-outputs" title="AI Elements">
            <Dropdown.Group label="AI-Powered Automated Text and Content Generation Pipeline Outputs">
              <Dropdown.Item id="lt-ai-summary">Artificial Intelligence Generated Multi-Paragraph Executive Summary Covering All Key Points of the Form Submission Content</Dropdown.Item>
              <Dropdown.Item id="lt-ai-subject">AI-Suggested Optimized Email Subject Line Derived from Semantic Analysis of the Full Customer Response Data</Dropdown.Item>
              <Dropdown.Item id="lt-ai-body">Fully Personalized Follow-Up Email Body Text Drafted and Tailored by the Integrated AI Writing Assistant</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Natural Language Sentiment Analysis and Customer Intent Classification Model Results">
              <Dropdown.Item id="lt-ai-sentiment">Composite Sentiment Polarity Score (Positive / Negative / Neutral) Detected Across the Entire Submission Text Body</Dropdown.Item>
              <Dropdown.Item id="lt-ai-intent">Primary Customer Intent Category Automatically Identified and Extracted from the Submitted Message Content</Dropdown.Item>
              <Dropdown.Item id="lt-ai-priority">Urgency and Business Priority Level Dynamically Assigned by the Downstream Classification and Routing Model</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
          <Dropdown.Section forId="payment-outputs" title="Payment">
            <Dropdown.Group label="Payment Gateway Transaction Authorization and Settlement Record Details">
              <Dropdown.Item id="lt-pay-id">Globally Unique Payment Gateway Transaction Reference and Authorization Identifier String</Dropdown.Item>
              <Dropdown.Item id="lt-pay-status">Real-Time Current Authorization, Capture, and End-to-End Settlement Status of the Payment Transaction</Dropdown.Item>
              <Dropdown.Item id="lt-pay-amount">Grand Total Amount Charged Including Applicable Taxes, Currency Conversion Fees, and Payment Processing Surcharges</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Cardholder Identity Verification and Associated Billing Address Information">
              <Dropdown.Item id="lt-pay-email">Verified Primary Email Address of Cardholder as Registered and Confirmed on File with the Payment Provider</Dropdown.Item>
              <Dropdown.Item id="lt-pay-name">Full Legal Name of the Cardholder Exactly as Embossed or Printed on the Front of the Payment Card</Dropdown.Item>
              <Dropdown.Item id="lt-pay-address">Complete Registered Billing Street Address Associated with the Payment Card for AVS Identity Verification</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
          <Dropdown.Section forId="webhooks" title="Webhooks">
            <Dropdown.Group label="Incoming HTTP Webhook Request Payload Structure and Event Field Definitions">
              <Dropdown.Item id="lt-wh-event">Fully Qualified Webhook Event Type Name Triggered by the Upstream External Third-Party Integration Service</Dropdown.Item>
              <Dropdown.Item id="lt-wh-timestamp">ISO 8601 Formatted UTC Timestamp Representing the Exact Moment the Event Was Dispatched from the Source System</Dropdown.Item>
              <Dropdown.Item id="lt-wh-signature">HMAC-SHA256 Cryptographic Signature Included in the Request Header Used for Authenticating Payload Integrity</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Webhook Delivery Lifecycle, HTTP Response Tracking, and Retry Attempt Metadata Fields">
              <Dropdown.Item id="lt-wh-status">HTTP Response Status Code Returned by the Registered Target Endpoint After Processing the Webhook Delivery Attempt</Dropdown.Item>
              <Dropdown.Item id="lt-wh-time">Total Measured Round-Trip Webhook Delivery and Server Response Latency Time Expressed in Milliseconds</Dropdown.Item>
              <Dropdown.Item id="lt-wh-endpoint">Fully Qualified Destination Endpoint URL Currently Registered and Active for Receiving This Webhook Event Type</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
        </Dropdown.Content>
      </Dropdown.Panel>
    </Dropdown>
  ),
};

export const CollapsibleNavigation = {
  name: 'Collapsible Navigation',
  args: {
    defaultOpen: true,
    defaultGroupExpanded: true,
    collapsed: false,
    autoCollapse: true,
    theme: 'light',
  },
  argTypes: {
    hideOnSelection: { table: { disable: true } },
    collapsed: { control: 'boolean', description: 'Initial collapsed state' },
    autoCollapse: AUTO_COLLAPSE_ARG_TYPE,
    theme: {
      control: 'select',
      options: ['light', 'dark'],
      description: 'Dropdown theme',
    },
  },
  decorators: [
    (Story, context) => (
      <div style={context.args.theme === 'dark' ? { background: '#12141f', padding: '24px', borderRadius: '8px', display: 'inline-block' } : {}}>
        <Story />
      </div>
    ),
  ],
  render: ({ defaultOpen, defaultGroupExpanded, collapsed, autoCollapse, theme }) => {
    const darkMode = theme === 'dark';

    return (
      <Dropdown displayMode="scroll" defaultOpen={defaultOpen} defaultGroupExpanded={defaultGroupExpanded} hideOnSelection={false} darkMode={darkMode}>
        <Dropdown.Trigger>
          <button type="button" className="ho-demo-trigger">Browse Categories</button>
        </Dropdown.Trigger>
        <Dropdown.Panel>
          <Dropdown.Navigation showAll allIcon={IconAll} collapsed={collapsed} autoCollapse={autoCollapse}>
            <Dropdown.NavigationItem id="fruits" icon={IconFruits}>Fruits</Dropdown.NavigationItem>
            <Dropdown.NavigationItem id="vegetables" icon={IconVegetables}>Vegetables</Dropdown.NavigationItem>
            <Dropdown.NavigationItem id="dairy" icon={IconDairy}>Dairy</Dropdown.NavigationItem>
            <Dropdown.NavigationItem id="meat" icon={IconMeat}>Meat</Dropdown.NavigationItem>
          </Dropdown.Navigation>
          <Dropdown.Content>
            <Dropdown.Section forId="fruits" title="Fruits">
              <Dropdown.Group label="Citrus">
                <Dropdown.Item id="c-orange">Orange</Dropdown.Item>
                <Dropdown.Item id="c-lemon">Lemon</Dropdown.Item>
                <Dropdown.Item id="c-grapefruit">Grapefruit</Dropdown.Item>
              </Dropdown.Group>
              <Dropdown.Group label="Tropical">
                <Dropdown.Item id="c-mango">Mango</Dropdown.Item>
                <Dropdown.Item id="c-pineapple">Pineapple</Dropdown.Item>
                <Dropdown.Item id="c-papaya">Papaya</Dropdown.Item>
              </Dropdown.Group>
            </Dropdown.Section>
            <Dropdown.Section forId="vegetables" title="Vegetables">
              <Dropdown.Group label="Leafy Greens">
                <Dropdown.Item id="c-spinach">Spinach</Dropdown.Item>
                <Dropdown.Item id="c-kale">Kale</Dropdown.Item>
                <Dropdown.Item id="c-arugula">Arugula</Dropdown.Item>
              </Dropdown.Group>
              <Dropdown.Group label="Root Vegetables">
                <Dropdown.Item id="c-carrot">Carrot</Dropdown.Item>
                <Dropdown.Item id="c-beet">Beet</Dropdown.Item>
                <Dropdown.Item id="c-radish">Radish</Dropdown.Item>
              </Dropdown.Group>
            </Dropdown.Section>
            <Dropdown.Section forId="dairy" title="Dairy">
              <Dropdown.Group label="Cheese">
                <Dropdown.Item id="c-cheddar">Cheddar</Dropdown.Item>
                <Dropdown.Item id="c-brie">Brie</Dropdown.Item>
                <Dropdown.Item id="c-gouda">Gouda</Dropdown.Item>
              </Dropdown.Group>
              <Dropdown.Group label="Milk &amp; Cream">
                <Dropdown.Item id="c-whole-milk">Whole Milk</Dropdown.Item>
                <Dropdown.Item id="c-cream">Heavy Cream</Dropdown.Item>
              </Dropdown.Group>
            </Dropdown.Section>
            <Dropdown.Section forId="meat" title="Meat">
              <Dropdown.Group label="Poultry">
                <Dropdown.Item id="c-chicken">Chicken</Dropdown.Item>
                <Dropdown.Item id="c-turkey">Turkey</Dropdown.Item>
              </Dropdown.Group>
              <Dropdown.Group label="Red Meat">
                <Dropdown.Item id="c-beef">Beef</Dropdown.Item>
                <Dropdown.Item id="c-lamb">Lamb</Dropdown.Item>
                <Dropdown.Item id="c-pork">Pork</Dropdown.Item>
              </Dropdown.Group>
            </Dropdown.Section>
          </Dropdown.Content>
        </Dropdown.Panel>
      </Dropdown>
    );
  },
};

export const SingleEntryLastCategory = {
  name: 'Single-Entry Last Category',
  args: {
    defaultOpen: true,
    defaultGroupExpanded: true,
    hideOnSelection: true,
    darkMode: false,
  },
  argTypes: {
    collapsed: { table: { disable: true } },
    autoCollapse: { table: { disable: true } },
    darkMode: { control: 'boolean', description: 'Dark mode' },
  },
  decorators: [
    (Story, context) => (
      <div style={context.args.darkMode ? { background: '#12141f', padding: '24px', borderRadius: '8px', display: 'inline-block' } : {}}>
        <Story />
      </div>
    ),
  ],
  render: ({ defaultOpen, defaultGroupExpanded, hideOnSelection, darkMode }) => (
    <Dropdown displayMode="scroll" defaultOpen={defaultOpen} defaultGroupExpanded={defaultGroupExpanded} hideOnSelection={hideOnSelection} darkMode={darkMode}>
      <Dropdown.Trigger>
        <button type="button" className="ho-demo-trigger">Browse Categories</button>
      </Dropdown.Trigger>
      <Dropdown.Panel>
        <Dropdown.Navigation showAll allIcon={IconAll}>
          <Dropdown.NavigationItem id="fruits" icon={IconFruits}>Fruits</Dropdown.NavigationItem>
          <Dropdown.NavigationItem id="vegetables" icon={IconVegetables}>Vegetables</Dropdown.NavigationItem>
          <Dropdown.NavigationItem id="dairy" icon={IconDairy}>Dairy</Dropdown.NavigationItem>
          <Dropdown.NavigationItem id="meat" icon={IconMeat}>Meat</Dropdown.NavigationItem>
          <Dropdown.NavigationItem id="featured" icon={IconStar}>Featured</Dropdown.NavigationItem>
        </Dropdown.Navigation>
        <Dropdown.Content>
          <Dropdown.Section forId="fruits" title="Fruits">
            <Dropdown.Group label="Citrus">
              <Dropdown.Item id="se-orange">Orange</Dropdown.Item>
              <Dropdown.Item id="se-lemon">Lemon</Dropdown.Item>
              <Dropdown.Item id="se-grapefruit">Grapefruit</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Tropical">
              <Dropdown.Item id="se-mango">Mango</Dropdown.Item>
              <Dropdown.Item id="se-pineapple">Pineapple</Dropdown.Item>
              <Dropdown.Item id="se-papaya">Papaya</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
          <Dropdown.Section forId="vegetables" title="Vegetables">
            <Dropdown.Group label="Leafy Greens">
              <Dropdown.Item id="se-spinach">Spinach</Dropdown.Item>
              <Dropdown.Item id="se-kale">Kale</Dropdown.Item>
              <Dropdown.Item id="se-arugula">Arugula</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Root Vegetables">
              <Dropdown.Item id="se-carrot">Carrot</Dropdown.Item>
              <Dropdown.Item id="se-beet">Beet</Dropdown.Item>
              <Dropdown.Item id="se-parsnip">Parsnip</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
          <Dropdown.Section forId="dairy" title="Dairy">
            <Dropdown.Group label="Cheese">
              <Dropdown.Item id="se-cheddar">Cheddar</Dropdown.Item>
              <Dropdown.Item id="se-brie">Brie</Dropdown.Item>
              <Dropdown.Item id="se-gouda">Gouda</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Milk &amp; Cream">
              <Dropdown.Item id="se-whole-milk">Whole Milk</Dropdown.Item>
              <Dropdown.Item id="se-heavy-cream">Heavy Cream</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
          <Dropdown.Section forId="meat" title="Meat">
            <Dropdown.Group label="Poultry">
              <Dropdown.Item id="se-chicken">Chicken</Dropdown.Item>
              <Dropdown.Item id="se-turkey">Turkey</Dropdown.Item>
              <Dropdown.Item id="se-duck">Duck</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Red Meat">
              <Dropdown.Item id="se-beef">Beef</Dropdown.Item>
              <Dropdown.Item id="se-pork">Pork</Dropdown.Item>
              <Dropdown.Item id="se-lamb">Lamb</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
          <Dropdown.Section forId="featured" title="Featured">
            <Dropdown.Group label="Editor's Pick">
              <Dropdown.Item id="se-featured-pick">Seasonal Special</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
        </Dropdown.Content>
      </Dropdown.Panel>
    </Dropdown>
  ),
};
