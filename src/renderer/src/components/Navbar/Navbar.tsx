import './Navbar.css';

import { Link, useLocation } from 'react-router';
import { PiCpuFill, PiHouseFill } from 'react-icons/pi';
import { Fragment } from 'react';

export const Navbar = (): React.JSX.Element => {
  const location = useLocation().pathname;

  const pages = [
    { path: '/', Icon: PiHouseFill },
    { path: '/train', Icon: PiCpuFill },
  ];

  return (
    <nav className="navbar">
      {pages.map(({ path, Icon }, idx) => {
        const selected = path === location;
        const prevSelected = idx > 0 && pages[idx - 1].path === location;

        return (
          <Fragment key={idx}>
            {idx > 0 && !selected && !prevSelected && <div className="nav-divider" />}
            <Link to={path} className={'nav-button' + (selected ? ' selected' : '')}>
              <div className="nav-square">
                <Icon className="nav-icon" />
              </div>
            </Link>
          </Fragment>
        );
      })}
    </nav>
  );
};
