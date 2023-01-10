import React, { useRef } from 'react';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';

const ChooseFile = (props) => {
  const {
    setPdfUrl
  } = props;

  const inputFile = useRef(null);

  const handleClick = () => {
    inputFile.current.click();
    if(inputFile.current.value) {
      const url = inputFile.current.value;
      const indexStart = url.search('path') + 5;
      //console.log(url.substring(indexStart));
      setPdfUrl(url.substring(indexStart));
    }
  }


  return (
    <>
      <input 
        type='file' 
        id='file' 
        ref={ inputFile } 
        style={{ display: 'none' }}
        onChange={ handleClick }
      />
      <Button 
        onClick={ handleClick }
        variant='secondary'
        className="m-5"
      >
        Choose File
      </Button>
    </>
  )
};

ChooseFile.propTypes = {
  setPdfUrl: PropTypes.func.isRequired
};

export default ChooseFile;