import { Dropdown } from '../components/Dropdown';

export default {
  title: 'Dropdown/7. Placement',
  parameters: {
    layout: 'centered',
  },
};

const PLACEMENTS = [
  'bottom-start',
  'bottom',
  'bottom-end',
  'top-start',
  'top',
  'top-end',
  'left',
  'right',
];

const SmallDropdown = ({ placement }) => (
  <Dropdown>
    <Dropdown.Trigger>
      <button type="button" className="ho-demo-trigger" style={{ minWidth: 120 }}>{placement}</button>
    </Dropdown.Trigger>
    <Dropdown.Panel placement={placement}>
      <Dropdown.Content>
        <Dropdown.Section>
          <Dropdown.Group label="Items">
            <Dropdown.Item id={`${placement}-1`}>Item 1</Dropdown.Item>
            <Dropdown.Item id={`${placement}-2`}>Item 2</Dropdown.Item>
            <Dropdown.Item id={`${placement}-3`}>Item 3</Dropdown.Item>
          </Dropdown.Group>
        </Dropdown.Section>
      </Dropdown.Content>
    </Dropdown.Panel>
  </Dropdown>
);

export const AllPlacements = {
  name: 'All Placements',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 120,
      padding: 200,
      justifyItems: 'center',
    }}>
      {PLACEMENTS.map(p => (
        <SmallDropdown key={p} placement={p} />
      ))}
    </div>
  ),
};

export const AutoPlacementScroll = {
  name: 'Auto Placement + Scroll',
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div style={{
      width: '300vw',
      height: '300vh',
      position: 'relative',
      background: 'repeating-linear-gradient(45deg, #f8f8ff 0px, #f8f8ff 20px, #eeeeff 20px, #eeeeff 40px)',
    }}>
      {/* center */}
      <PlacedTrigger label="bottom-start (center)" placement="bottom-start" top="50%" left="50%" />

      {/* corners */}
      <PlacedTrigger label="bottom-start (top-left)" placement="bottom-start" top={40} left={40} />
      <PlacedTrigger label="bottom-end (top-right)" placement="bottom-end" top={40} right={40} />
      <PlacedTrigger label="top-start (bottom-left)" placement="top-start" bottom={40} left={40} />
      <PlacedTrigger label="top-end (bottom-right)" placement="top-end" bottom={40} right={40} />

      {/* mid edges */}
      <PlacedTrigger label="bottom (top-center)" placement="bottom" top={40} left="50%" />
      <PlacedTrigger label="top (bottom-center)" placement="top" bottom={40} left="50%" />
      <PlacedTrigger label="right (left-center)" placement="right" top="50%" left={40} />
      <PlacedTrigger label="left (right-center)" placement="left" top="50%" right={40} />

      <div style={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.55)',
        color: '#fff',
        padding: '6px 14px',
        borderRadius: 8,
        fontSize: 12,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}>
        Scroll in any direction — panel should follow the trigger and flip when near viewport edges
      </div>
    </div>
  ),
};

function PlacedTrigger({ label, placement, top, left, right, bottom }) {
  return (
    <div style={{
      position: 'absolute', top, left, right, bottom,
      transform: [
        top === '50%' ? 'translateY(-50%)' : '',
        left === '50%' ? 'translateX(-50%)' : '',
      ].filter(Boolean).join(' ') || undefined,
    }}>
      <Dropdown>
        <Dropdown.Trigger>
          <button type="button" className="ho-demo-trigger ho-demo-trigger--sm" style={{ whiteSpace: 'nowrap' }}>{label}</button>
        </Dropdown.Trigger>
        <Dropdown.Panel placement={placement}>
          <Dropdown.Content>
            <Dropdown.Section>
              <Dropdown.Group label="Items">
                <Dropdown.Item id={`${label}-1`}>Item 1</Dropdown.Item>
                <Dropdown.Item id={`${label}-2`}>Item 2</Dropdown.Item>
                <Dropdown.Item id={`${label}-3`}>Item 3</Dropdown.Item>
              </Dropdown.Group>
            </Dropdown.Section>
          </Dropdown.Content>
        </Dropdown.Panel>
      </Dropdown>
    </div>
  );
}

