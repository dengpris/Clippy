import React, { useRef } from 'react';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
import { getTitle } from '../hovering/GetDocInfo';

const ChooseFile = (props) => {
  const {
    setPdfData,
  } = props;

  const inputFile = useRef(null);

  const handleClick = () => {
    inputFile.current.click();
    const file = inputFile.current.files[0];
    if(file) {
      setPdfData(file);
    }
  }


  return (
    <>
      <input 
        type='file' 
        id='file' 
        ref={ inputFile } 
        accept=".pdf"
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
  setPdfData: PropTypes.func.isRequired,
};

export default ChooseFile;