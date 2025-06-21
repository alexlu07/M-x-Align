import './Navbar.css';

import { Link, useLocation } from 'react-router';
import { PiCpuFill, PiHouseFill } from 'react-icons/pi';

export const Navbar = (): React.JSX.Element => {
  const location = useLocation().pathname;

  const pages = [
    { path: '/', icon: <PiHouseFill className="nav-icon" /> },
    { path: '/train', icon: <PiCpuFill className="nav-icon" /> },
    { path: '/train', icon: <PiCpuFill className="nav-icon" /> },
  ];

  return (
    <nav className="navbar">
      {pages.map(({ path, icon }, idx) => {
        const selected = path === location;
        const prevSelected = idx > 0 && pages[idx - 1].path === location;

        return (
          <>
            {idx > 0 && !selected && !prevSelected && <div className="nav-divider" />}
            <Link to={path} key={idx} className={'nav-button' + (selected ? ' selected' : '')}>
              <div className="nav-square">{icon}</div>
            </Link>
          </>
        );
      })}
    </nav>
  );
};
