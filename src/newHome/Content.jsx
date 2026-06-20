import { Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';
import './Content.css';

/**
 * Content Component
 * 
 * Main content area that displays:
 * - Routes via React Router <Outlet>
 * - Page content from routed components
 * 
 * Flexible and responsive with proper spacing
 */

export default function Content({ onMenuClick = () => {} }) {
  return (
    <section className="content">
      <Outlet context={{ onMenuClick }} />
    </section>
  );
}

Content.propTypes = {
  onMenuClick: PropTypes.func,
};
