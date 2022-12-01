import React, { useRef } from 'react';
import Button from 'react-bootstrap/Button';

const ChooseFile = (props) => {
  const inputFile = useRef(null);

  const handleClick = () => {
    inputFile.current.click();
  }

  const handleFileChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if(!file) {
      return;
    }
    event.target.value = null;
    console.log('name is ', file.name);
  }

  return (
    <div>
      <input
        type='file'
        onChange={ () => handleFileChange() }
        ref={ inputFile }
      />
      <Button
        onClick={ () => handleClick() }
      >Get file
      </Button>
    </div>
  )
};

export default ChooseFile;