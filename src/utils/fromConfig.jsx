import { forwardRef } from 'react';
import DropdownRoot from '../components/Dropdown/Dropdown';
import DropdownPanel from '../components/Dropdown/DropdownPanel';
import DropdownContent from '../components/Dropdown/DropdownContent';
import {
  normalizeConfig,
  renderTriggerNode,
  renderNavigationNode,
  renderSectionNodes,
} from './buildFromConfig';
export { buildFromConfig } from './buildFromConfig';

/**
 * fromConfig — render a full Dropdown tree from a plain JS config object.
 *
 * @param {object} config
 * @param {React.Ref}  [ref]   — forwarded to the root Dropdown ref
 * @returns JSX
 *
 * Config schema:
 * {
 *   // Root props (all optional)
 *   displayMode?:          'scroll' | 'tab'
 *   defaultOpen?:          boolean
 *   defaultGroupExpanded?: boolean | 'first'
 *   hideOnSelection?:      boolean
 *   onEvent?:              ({ type, payload, prev }) => any
 *
 *   // Trigger
 *   trigger: ReactNode | string | {
 *     label:      string
 *     className?: string
 *     component?: ComponentType
 *   }
 *
 *   // Panel (optional — defaults used if omitted)
 *   panel?: {
 *     placement?: string   // default 'bottom-start'
 *     offset?:    number   // default 8
 *   }
 *
 *   // Navigation column (optional)
 *   navigation?: { ... }           // legacy alias for nav config
 *   items?: Array<{                // preferred alias for navigation.items
 *     id?:    string
 *     label:  string
 *     icon?:  ReactNode | FC
 *   }>
 *   showAll?:      boolean         // preferred alias for navigation.showAll
 *   allLabel?:     string
 *   allIcon?:      ReactNode | FC
 *   collapsed?:    boolean
 *   autoCollapse?: boolean
 *
 *   // Content column
 *   content: {
 *     searchPlaceholder?: string    // include search bar when provided
 *     sections: Array<{
 *       for?:   string              // matches navigation item id
 *       title?: string
 *       items?: Array<{
 *         id?:              string
 *         label?:           string
 *         defaultExpanded?: boolean
 *         items: Array<{
 *           id:               string
 *           label:            string
 *           type?:            'click' | 'checkbox'
 *           icon?:            ReactNode | FC
 *           defaultChecked?:  boolean
 *           checkIcon?:       ReactNode | FC
 *           component?:       ComponentType
 *         }>
 *       }>
 *     }>
 *   }
 * }
 */
function renderFromConfig(config, ref) {
  const {
    rootConfig,
    trigger,
    panel,
    navigation,
    content,
  } = normalizeConfig(config);
  const {
    displayMode,
    defaultOpen,
    defaultGroupExpanded,
    hideOnSelection,
    onEvent,
    ...rootRest
  } = rootConfig;
  const triggerNode = renderTriggerNode(trigger);
  const navNode = renderNavigationNode(navigation);
  const { searchPlaceholder, sections = [], ...contentRest } = content || {};
  const contentNode = (
    <DropdownContent searchPlaceholder={searchPlaceholder} {...contentRest}>
      {renderSectionNodes(sections)}
    </DropdownContent>
  );

  const { placement: panelPlacement, offset: panelOffset, ...panelRest } = panel;
  const panelChildren = (
    <DropdownPanel placement={panelPlacement} offset={panelOffset} {...panelRest}>
      {navNode}
      {contentNode}
    </DropdownPanel>
  );

  return (
    <DropdownRoot
      ref={ref}
      displayMode={displayMode}
      defaultOpen={defaultOpen}
      defaultGroupExpanded={defaultGroupExpanded}
      hideOnSelection={hideOnSelection}
      onEvent={onEvent}
      {...rootRest}
    >
      {triggerNode}
      {panelChildren}
    </DropdownRoot>
  );
}

/**
 * DropdownFromConfig — React component wrapper.
 * <DropdownFromConfig config={myConfig} />
 */
export const DropdownFromConfig = forwardRef(function DropdownFromConfig({ config }, ref) {
  return renderFromConfig(config, ref);
});

/**
 * fromConfig(config, ref?) — imperative helper, returns JSX directly.
 */
export function fromConfig(config, ref) {
  return renderFromConfig(config, ref);
}

export default fromConfig;
