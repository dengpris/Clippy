import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import './style.css'

const CrossRef = (props) => {
  const {
    info,
    hideCrossRefInfo,
    setShowCrossRef,
  } = props;

  const handleClose = () => setShowCrossRef(false)
  
  return(
    <div className="sidebar p-4">

    <ul>
      {info.map((item) => {
        if (item === undefined) return null; 
        return <li key={item}>{item}</li>;
      })}
    </ul>

      <Button 
        id="close"
        onClick={() => handleClose() }
      >Close
      </Button>
      </div>
  )
};

CrossRef.propTypes = {
    info: PropTypes.array,
    hideCrossRefInfo: PropTypes.func
}

export default CrossRef;
