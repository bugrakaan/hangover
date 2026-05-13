import { Dropdown } from '../components/Dropdown';

export default {
  title: 'Dropdown/3. Tab Mode',
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
  },
};

export const TabMode = {
  args: {
    defaultOpen: false,
    defaultGroupExpanded: true,
    hideOnSelection: true,
  },
  render: ({ defaultOpen, defaultGroupExpanded, hideOnSelection }) => (
    <Dropdown displayMode="tab" defaultOpen={defaultOpen} defaultGroupExpanded={defaultGroupExpanded} hideOnSelection={hideOnSelection}>
      <Dropdown.Trigger>
        <button type="button" className="ho-demo-trigger">Open Tab Dropdown</button>
      </Dropdown.Trigger>
      <Dropdown.Panel>
        <Dropdown.Navigation showAll>
          <Dropdown.NavigationItem id="frontend">Frontend</Dropdown.NavigationItem>
          <Dropdown.NavigationItem id="backend">Backend</Dropdown.NavigationItem>
          <Dropdown.NavigationItem id="design">Design</Dropdown.NavigationItem>
        </Dropdown.Navigation>
        <Dropdown.Content>
          <Dropdown.Section forId="frontend" title="Frontend">
            <Dropdown.Group label="JavaScript">
              <Dropdown.Item id="react">React</Dropdown.Item>
              <Dropdown.Item id="vue">Vue</Dropdown.Item>
              <Dropdown.Item id="svelte">Svelte</Dropdown.Item>
              <Dropdown.Item id="angular">Angular</Dropdown.Item>
              <Dropdown.Item id="solid">SolidJS</Dropdown.Item>
              <Dropdown.Item id="preact">Preact</Dropdown.Item>
              <Dropdown.Item id="qwik">Qwik</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="CSS">
              <Dropdown.Item id="scss">SCSS</Dropdown.Item>
              <Dropdown.Item id="css-modules">CSS Modules</Dropdown.Item>
              <Dropdown.Item id="styled-components">styled-components</Dropdown.Item>
              <Dropdown.Item id="vanilla-extract">vanilla-extract</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Build Tools">
              <Dropdown.Item id="vite">Vite</Dropdown.Item>
              <Dropdown.Item id="webpack">Webpack</Dropdown.Item>
              <Dropdown.Item id="esbuild">esbuild</Dropdown.Item>
              <Dropdown.Item id="rollup">Rollup</Dropdown.Item>
              <Dropdown.Item id="parcel">Parcel</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
          <Dropdown.Section forId="backend" title="Backend">
            <Dropdown.Group label="Node.js">
              <Dropdown.Item id="express">Express</Dropdown.Item>
              <Dropdown.Item id="fastify">Fastify</Dropdown.Item>
              <Dropdown.Item id="nestjs">NestJS</Dropdown.Item>
              <Dropdown.Item id="hono">Hono</Dropdown.Item>
              <Dropdown.Item id="koa">Koa</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Python">
              <Dropdown.Item id="django">Django</Dropdown.Item>
              <Dropdown.Item id="fastapi">FastAPI</Dropdown.Item>
              <Dropdown.Item id="flask">Flask</Dropdown.Item>
              <Dropdown.Item id="starlette">Starlette</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Databases">
              <Dropdown.Item id="postgres">PostgreSQL</Dropdown.Item>
              <Dropdown.Item id="mysql">MySQL</Dropdown.Item>
              <Dropdown.Item id="mongodb">MongoDB</Dropdown.Item>
              <Dropdown.Item id="redis">Redis</Dropdown.Item>
              <Dropdown.Item id="sqlite">SQLite</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
          <Dropdown.Section forId="design" title="Design">
            <Dropdown.Group label="Tools">
              <Dropdown.Item id="figma">Figma</Dropdown.Item>
              <Dropdown.Item id="sketch">Sketch</Dropdown.Item>
              <Dropdown.Item id="framer">Framer</Dropdown.Item>
              <Dropdown.Item id="penpot">Penpot</Dropdown.Item>
              <Dropdown.Item id="affinity">Affinity Designer</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Prototyping">
              <Dropdown.Item id="principle">Principle</Dropdown.Item>
              <Dropdown.Item id="protopie">ProtoPie</Dropdown.Item>
              <Dropdown.Item id="origami">Origami Studio</Dropdown.Item>
            </Dropdown.Group>
            <Dropdown.Group label="Assets">
              <Dropdown.Item id="unsplash">Unsplash</Dropdown.Item>
              <Dropdown.Item id="iconify">Iconify</Dropdown.Item>
              <Dropdown.Item id="phosphor">Phosphor Icons</Dropdown.Item>
              <Dropdown.Item id="heroicons">Heroicons</Dropdown.Item>
            </Dropdown.Group>
          </Dropdown.Section>
        </Dropdown.Content>
      </Dropdown.Panel>
    </Dropdown>
  ),
};
