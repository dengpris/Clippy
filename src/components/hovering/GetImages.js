
import React, { useState, useEffect } from 'react';
import * as PDFJS from 'pdfjs-dist';
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import pdfjsLib from 'pdfjs-dist'
import { Modal, Button } from 'react-bootstrap';
import { getImgFromArr } from 'array-to-image';

PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;






const GetImages = () => {

  const [image, setImage] = useState([]);
  const [imageUrl, setImageUrl] = useState(null)

  const [start, setStart] = useState(null)
  const [end, setEnd] = useState(null)


  useEffect(() => {
    if(start && end) {
      return end-start
    }
  }, [start, end])



  // async function extractPageImage(page) {
  //   const operatorList = await page.getOperatorList().then((operatorList) => {
  //     return operatorList;
  //   });
  //   const images = [];

  //   // Iterate over the page operators to find images
  //   for (let i = 0; i < operatorList.fnArray.length; i++) {
  //     const operator = operatorList.fnArray[i];

  //     if (operator === PDFJS.OPS.paintImageXObject) {
  //       console.log('inside here')
  //       const imageIndex = operatorList.argsArray[i][0];
  //       const imageData = await page.objs.get(imageIndex);

  //       console.log('image data is ', imageData, typeof(imageData.data))
  //       images.push({
  //         width: imageData.width,
  //         height: imageData.height,
  //         data: imageData.data,
  //       });

  //       renderImg(imageData.data)


  //     }
  //   }
  //   console.log('images here ', images)
  //   return images;
  // }

  async function extractPageImage(page) {
    const operatorList = await page.getOperatorList().then((operatorList) => {
      return operatorList;
    });
    const images = [];
  
    // Iterate over the page operators to find images
    for (let i = 0; i < operatorList.fnArray.length; i++) {
      const operator = operatorList.fnArray[i];
  
      if (operator === PDFJS.OPS.paintImageXObject) {
        const imageIndex = operatorList.argsArray[i][0];
        const imageData = await page.objs.get(imageIndex);
  
        // Create a canvas element to render the image
        const canvas = document.createElement("canvas");
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        const ctx = canvas.getContext("2d");
  
        // Create an ImageData object from the image data
        const imgData = new ImageData(
          new Uint8ClampedArray(imageData.data),
          imageData.width,
          imageData.height
        );
  
        // Draw the ImageData to the canvas
        ctx.putImageData(imgData, 0, 0);
  
        // Add the canvas element to the images array
        images.push(canvas.toDataURL());
        renderImg(imageData.data)
      }
    }
  
    return images;
  }
  

  async function extractAllImages(pdfDocument) {
    const images = [];

    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const pageImages = await extractPageImage(page);

      images.push(...pageImages);
    }

    return images;
  }

  const loadPdfDocument = async (pdfPath) => {
    const pdf = await PDFJS.getDocument(pdfPath).promise;
    return pdf;
  }

  const pdfPath = require('../../pdfLibrary/nature12373.pdf');

  const handleClick = async () => {
    
    // Load the PDF document and extract the images
    const pdf = await loadPdfDocument(pdfPath);
    const images = await extractAllImages(pdf);
    console.log(images); // Do something with the extracted images

    setImage(images);
  }

  const renderImg = async (data) => {
    setStart(Date.now()) // start
    console.log('called blobs');
    const blob = new Blob([data], { type: 'image/jpeg' });
    const url = URL.createObjectURL(blob);
    setImageUrl(url);
    setEnd(Date.now())
  };

  return (
    <>
    {/* <button onClick={handleClick}>Click me for thing</button> */}
    <button onClick={renderImg}>Click me for thing</button>
    <canvas id='canvas'></canvas>
    {/* <p>image url is { imageUrl }</p> */}

    {/* { imageUrl && <img src={imageUrl} alt='imagqe'></img> } */}
    <img src='blob:http://localhost:3000/a713fb12-8ede-4271-99be-b57e56d5f930' alt={ imageUrl }></img>
    
    </>
    
  );



}

export default GetImages;


