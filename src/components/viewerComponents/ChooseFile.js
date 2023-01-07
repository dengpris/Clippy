import React, { useRef, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';

const ChooseFile = (props) => {

  const [imageUrl, setImageUrl] = useState("");
  
  const getPDFname = (event) => {
    console.log(event.target.files[0].name)
    let value = event.target.files[0].name;
    setImageUrl([value]);
  };

  useEffect(() => {
    console.log('image url changed ', imageUrl)
  }, [imageUrl])

  return (
    <form>
      <div>
        <input 
          type="file" 
          onChange={ getPDFname }
          accept='.pdf'
        />
      </div>
    </form>
  )
};

export default ChooseFile;