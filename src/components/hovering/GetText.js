// get all text
// look for [] or other links/figures 
// add event listener somewhere else
// on hover, scan other pages for the corresponding cross reference
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { getPDFText } from '../meaningcloudSummary/GenerateSummary';

import * as PDFJS from 'pdfjs-dist';
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const GetText = (props) => {
  const {
    url
  } = props;

  const [fullText, setFullText] = useState('');
  const [doi, setDoi] = useState('');

  async function onGetText() {
    let text = await getPDFText(url);
    setFullText(text);
    console.log(text);
  }




  async function getDOI() {
    PDFJS.getDocument(url).promise.then(
      function(doc) {
        let pdfDoc = doc;   
        pdfDoc.getMetadata().then(function(data) {
          console.log(data);
          if(data.metadata.get("xmp:identifier")) {
            setDoi(data.metadata.get("xmp:identifier"))
          } else {
            setDoi(data.metadata.get("dc:identifier"))
          }
        }).catch(function(err) {
          console.log('Error getting meta data');
          console.log(err);
        });
      }).catch(function(err) {
        console.log('Error getting PDF from ' + url);
        console.log(err);
    });
  }


  // get citations and map them with the number they are in the paper

  return (
    <>
      <Button
        onClick={ () => onGetText()}
      >
        Click me
      </Button>
      <Button
        onClick={ () => getDOI() }
      >
        anothea one me
      </Button>
      { fullText === '' ? <span>henlo</span> : <span>not null</span>}
      <span>doi is { doi }</span>
    </>
  )
};


GetText.propTypes = {
  url: PropTypes.string
};

export default GetText;