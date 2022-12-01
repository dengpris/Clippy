import React from 'react';
import './viewerComponents.css';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';

const Sidebar = (props) => {
    const {
        summary,
        hideSidebar
    } = props;
    return(
        <div className="sidebar">
            <p>{ summary }</p>
            <Button 
              id="close"
              onClick={() => { hideSidebar }}
            >Close
            </Button>
        </div>
    )
};

Sidebar.propTypes = {
    summary: PropTypes.string,
    hideSidebar: PropTypes.func
}

export default Sidebar;
