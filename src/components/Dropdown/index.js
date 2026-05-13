import DropdownRoot from './Dropdown';
import DropdownTrigger from './DropdownTrigger';
import DropdownPanel from './DropdownPanel';
import DropdownNav from './DropdownNav';
import DropdownNavItem from './DropdownNavItem';
import DropdownContent from './DropdownContent';
import DropdownSection from './DropdownSection';
import DropdownGroup from './DropdownGroup';
import DropdownItem from './DropdownItem';
import fromConfig, { DropdownFromConfig } from '../../utils/fromConfig';

const Dropdown = Object.assign(DropdownRoot, {
  Trigger: DropdownTrigger,
  Panel: DropdownPanel,
  Navigation: DropdownNav,
  NavigationItem: DropdownNavItem,
  Content: DropdownContent,
  Section: DropdownSection,
  Group: DropdownGroup,
  Item: DropdownItem,
  fromConfig,
  FromConfig: DropdownFromConfig,
});

export { Dropdown, fromConfig, DropdownFromConfig };
export default Dropdown;
