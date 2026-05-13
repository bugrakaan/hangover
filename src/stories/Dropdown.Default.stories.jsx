import { Dropdown } from '../components/Dropdown';

export default {
  title: 'Dropdown/1. Basic',
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

export const Basic = {
  name: 'Basic',
  args: {
    defaultOpen: false,
    defaultGroupExpanded: true,
    hideOnSelection: true,
  },
  argTypes: {
    displayMode: { table: { disable: true } },
  },
  render: ({ defaultOpen, defaultGroupExpanded, hideOnSelection }) => (
    <Dropdown
      defaultOpen={defaultOpen}
      defaultGroupExpanded={defaultGroupExpanded}
      hideOnSelection={hideOnSelection}
    >
      <Dropdown.Trigger>
        <button type="button" className="ho-demo-trigger">Open Dropdown</button>
      </Dropdown.Trigger>
      <Dropdown.Panel>
        <Dropdown.Content>
          <Dropdown.Section>
            <Dropdown.Group label="Fruits">
              <Dropdown.Item id="apple">Apple</Dropdown.Item>
              <Dropdown.Item id="banana">Banana</Dropdown.Item>
              <Dropdown.Item id="cherry">Cherry</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Vegetables">
              <Dropdown.Item id="carrot">Carrot</Dropdown.Item>
              <Dropdown.Item id="broccoli">Broccoli</Dropdown.Item>
              <Dropdown.Item id="spinach">Spinach</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
        </Dropdown.Content>
      </Dropdown.Panel>
    </Dropdown>
  ),
};

export const WithNav = {
  args: {
    displayMode: 'scroll',
    defaultOpen: false,
    defaultGroupExpanded: true,
    hideOnSelection: true,
  },
  render: ({ displayMode, defaultOpen, defaultGroupExpanded, hideOnSelection }) => (
    <Dropdown
      displayMode={displayMode}
      defaultOpen={defaultOpen}
      defaultGroupExpanded={defaultGroupExpanded}
      hideOnSelection={hideOnSelection}
    >
      <Dropdown.Trigger>
        <button type="button" className="ho-demo-trigger">Open with Navigation</button>
      </Dropdown.Trigger>
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
              <Dropdown.Item id="lime">Lime</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Berries">
              <Dropdown.Item id="strawberry">Strawberry</Dropdown.Item>
              <Dropdown.Item id="blueberry">Blueberry</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
          <Dropdown.Section forId="vegetables" title="Vegetables">
            <Dropdown.Group label="Leafy">
              <Dropdown.Item id="spinach2">Spinach</Dropdown.Item>
              <Dropdown.Item id="kale">Kale</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
        </Dropdown.Content>
      </Dropdown.Panel>
    </Dropdown>
  ),
};

export const SingleSection = {
  name: 'Single Section (Auto-transform)',
  args: {
    defaultOpen: false,
    defaultGroupExpanded: true,
    hideOnSelection: true,
  },
  argTypes: {
    displayMode: { table: { disable: true } },
  },
  render: ({ defaultOpen, defaultGroupExpanded, hideOnSelection }) => (
    <Dropdown
      displayMode="scroll"
      defaultOpen={defaultOpen}
      defaultGroupExpanded={defaultGroupExpanded}
      hideOnSelection={hideOnSelection}
    >
      <Dropdown.Trigger>
        <button type="button" className="ho-demo-trigger">Single Section</button>
      </Dropdown.Trigger>
      <Dropdown.Panel>
        <Dropdown.Navigation showAll>
          <Dropdown.NavigationItem id="fruits">Fruits</Dropdown.NavigationItem>
        </Dropdown.Navigation>
        <Dropdown.Content>
          <Dropdown.Section forId="fruits" title="Fruits">
            <Dropdown.Group label="Citrus">
              <Dropdown.Item id="orange">Orange</Dropdown.Item>
              <Dropdown.Item id="lemon">Lemon</Dropdown.Item>
              <Dropdown.Item id="lime">Lime</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Berries">
              <Dropdown.Item id="strawberry">Strawberry</Dropdown.Item>
              <Dropdown.Item id="blueberry">Blueberry</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
        </Dropdown.Content>
      </Dropdown.Panel>
    </Dropdown>
  ),
};

export const EmptyGroup = {
  argTypes: {
    displayMode: { table: { disable: true } },
    hideOnSelection: { table: { disable: true } },
    defaultGroupExpanded: { table: { disable: true } },
  },
  render: () => (
    <Dropdown defaultOpen>
      <Dropdown.Trigger>
        <button type="button" className="ho-demo-trigger">Open Dropdown</button>
      </Dropdown.Trigger>
      <Dropdown.Panel>
        <Dropdown.Content>
          <Dropdown.Section>
            <Dropdown.Group label="Fields">
            </Dropdown.Group>
            <Dropdown.Group label="Metrics">
              <Dropdown.Item id="revenue">Revenue</Dropdown.Item>
              <Dropdown.Item id="sessions">Sessions</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
        </Dropdown.Content>
      </Dropdown.Panel>
    </Dropdown>
  ),
};

export const OpenByDefault = {
  argTypes: {
    displayMode: { table: { disable: true } },
    hideOnSelection: { table: { disable: true } },
    defaultGroupExpanded: { table: { disable: true } },
    defaultOpen: { table: { disable: true } },
  },
  render: () => (
    <Dropdown defaultOpen>
      <Dropdown.Trigger>
        <button type="button" className="ho-demo-trigger">Already Open</button>
      </Dropdown.Trigger>
      <Dropdown.Panel>
        <Dropdown.Content>
          <Dropdown.Section>
            <Dropdown.Group label="Items">
              <Dropdown.Item id="item1">Item 1</Dropdown.Item>
              <Dropdown.Item id="item2">Item 2</Dropdown.Item>
              <Dropdown.Item id="item3">Item 3</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
        </Dropdown.Content>
      </Dropdown.Panel>
    </Dropdown>
  ),
};
