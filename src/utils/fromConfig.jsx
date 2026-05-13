import { forwardRef } from 'react';
import DropdownRoot from '../components/Dropdown/Dropdown';
import DropdownTrigger from '../components/Dropdown/DropdownTrigger';
import DropdownPanel from '../components/Dropdown/DropdownPanel';
import DropdownNav from '../components/Dropdown/DropdownNav';
import DropdownNavItem from '../components/Dropdown/DropdownNavItem';
import DropdownContent from '../components/Dropdown/DropdownContent';
import DropdownSection from '../components/Dropdown/DropdownSection';
import DropdownGroup from '../components/Dropdown/DropdownGroup';
import DropdownItem from '../components/Dropdown/DropdownItem';

function toGeneratedId(value, fallback) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || fallback;
}

function normalizeConfig(config) {
  const {
    trigger,
    panel = {},
    navigation,
    items: rootItems,
    content,
    showAll,
    allLabel,
    allIcon,
    collapsed,
    autoCollapse,
    ...rootConfig
  } = config;

  const navigationAliases = {
    ...(showAll !== undefined ? { showAll } : {}),
    ...(allLabel !== undefined ? { allLabel } : {}),
    ...(allIcon !== undefined ? { allIcon } : {}),
    ...(collapsed !== undefined ? { collapsed } : {}),
    ...(autoCollapse !== undefined ? { autoCollapse } : {}),
  };

  const resolvedNavigation = Array.isArray(rootItems)
    ? {
      ...(navigation ?? {}),
      ...navigationAliases,
      items: rootItems,
    }
    : navigation
      ? {
        ...navigation,
        ...navigationAliases,
      }
      : null;

  const rawNavigationItems = resolvedNavigation?.items ?? [];
  const explicitSections = content?.sections ?? [];
  const explicitSectionsByFor = new Map(
    explicitSections
      .filter(section => section?.for || section?.forId)
      .map(section => [section.for ?? section.forId, section]),
  );

  const consumedSectionIds = new Set();

  const navigationItems = rawNavigationItems.map((item, index) => {
    const {
      id: rawId,
      label,
      icon,
      title,
      groups,
      items: nestedItems,
      content: nestedContent,
      section,
      ...navItemRest
    } = item;

    const id = rawId ?? toGeneratedId(label, `section-${index + 1}`);
    const nestedSection = section ?? nestedContent ?? ((groups || nestedItems) ? { title, items: nestedItems, groups } : null);

    if (explicitSectionsByFor.has(id)) {
      consumedSectionIds.add(id);
    }

    return {
      id,
      label,
      icon,
      navItemRest,
      derivedSection: explicitSectionsByFor.get(id) ?? (nestedSection
        ? {
          ...(typeof nestedSection === 'object' ? nestedSection : {}),
          for: id,
          title: nestedSection?.title ?? title ?? label,
          items: nestedSection?.items ?? nestedSection?.groups ?? nestedItems ?? groups ?? [],
        }
        : null),
    };
  });

  const remainingSections = explicitSections.filter((section) => {
    const sectionId = section?.for ?? section?.forId;
    return !sectionId || !consumedSectionIds.has(sectionId);
  });

  const sections = [
    ...navigationItems
      .map(item => item.derivedSection)
      .filter(Boolean),
    ...remainingSections,
  ];

  return {
    rootConfig,
    trigger,
    panel,
    navigation: navigation
      ? {
        ...resolvedNavigation,
        items: navigationItems,
      }
      : resolvedNavigation
        ? {
          ...resolvedNavigation,
          items: navigationItems,
        }
        : null,
    content: {
      ...(content ?? {}),
      sections,
    },
  };
}

function renderTriggerNode(trigger) {
  let triggerNode;

  if (trigger == null) {
    triggerNode = null;
  } else if (typeof trigger === 'string') {
    triggerNode = (
      <DropdownTrigger>
        <button type="button">{trigger}</button>
      </DropdownTrigger>
    );
  } else if (typeof trigger === 'function') {
    const TriggerComp = trigger;
    triggerNode = (
      <DropdownTrigger>
        <TriggerComp />
      </DropdownTrigger>
    );
  } else if (typeof trigger === 'object' && trigger.label !== undefined && !trigger.$$typeof) {
    const { label, className, component: TriggerComp } = trigger;
    triggerNode = (
      <DropdownTrigger>
        {TriggerComp
          ? <TriggerComp className={className}>{label}</TriggerComp>
          : <button type="button" className={className}>{label}</button>
        }
      </DropdownTrigger>
    );
  } else {
    triggerNode = trigger;
  }

  return triggerNode;
}

function renderNavigationNode(navigation) {
  if (!navigation) {
    return null;
  }

  const { items = [], showAll, allLabel, allIcon, collapsed, autoCollapse, ...navRest } = navigation;

  return (
    <DropdownNav
      showAll={showAll}
      allLabel={allLabel}
      allIcon={allIcon}
      collapsed={collapsed}
      autoCollapse={autoCollapse}
      {...navRest}
    >
      {items.map(({ id, label, icon, navItemRest = {} }) => (
        <DropdownNavItem key={id} id={id} icon={icon} {...navItemRest}>
          {label}
        </DropdownNavItem>
      ))}
    </DropdownNav>
  );
}

function renderSectionNodes(sections) {
  return sections.map((section, si) => {
    const {
      for: forId,
      forId: forIdProp,
      title,
      groups,
      items: sectionItems,
      ...sectionRest
    } = section;
    const sectionKey = forId ?? forIdProp ?? si;
    const groupConfigs = groups ?? sectionItems ?? [];

    const groupNodes = groupConfigs.map((group, gi) => {
      const { id: groupId, label: groupLabel, defaultExpanded, items: groupItems = [], ...groupRest } = group;
      const itemNodes = groupItems.map((item) => {
        const { id, label, type, icon, defaultChecked, checkIcon, component, ...itemRest } = item;
        return (
          <DropdownItem
            key={id}
            id={id}
            type={type}
            icon={icon}
            defaultChecked={defaultChecked}
            checkIcon={checkIcon}
            component={component}
            {...itemRest}
          >
            {label}
          </DropdownItem>
        );
      });

      return (
        <DropdownGroup
          key={groupId ?? gi}
          id={groupId}
          label={groupLabel}
          defaultExpanded={defaultExpanded}
          {...groupRest}
        >
          {itemNodes}
        </DropdownGroup>
      );
    });

    return (
      <DropdownSection key={sectionKey} for={forId ?? forIdProp} title={title} {...sectionRest}>
        {groupNodes}
      </DropdownSection>
    );
  });
}

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
 * buildFromConfig — builds only the panel children (trigger + panel).
 * Used internally by Dropdown root when `fromConfig` prop is passed.
 * Does NOT wrap with a root <Dropdown> — avoids circular imports.
 */
export function buildFromConfig(config) {
  const {
    trigger,
    panel,
    navigation,
    content,
  } = normalizeConfig(config);
  const triggerNode = renderTriggerNode(trigger);
  const navNode = renderNavigationNode(navigation);
  const { searchPlaceholder, sections = [], ...contentRest } = content || {};

  const { placement: panelPlacement, offset: panelOffset, ...panelRest } = panel;
  return (
    <>
      {triggerNode}
      <DropdownPanel placement={panelPlacement} offset={panelOffset} {...panelRest}>
        {navNode}
        <DropdownContent searchPlaceholder={searchPlaceholder} {...contentRest}>
          {renderSectionNodes(sections)}
        </DropdownContent>
      </DropdownPanel>
    </>
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
