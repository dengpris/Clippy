import React from 'react';
import './viewerComponents.css';

const Sidebar = (props) => {
    return(
        <div className="sidebar">
            <p>{props.summary}</p>
            <button id="close">&times; close</button>
        </div>
    )
}

export default Sidebar