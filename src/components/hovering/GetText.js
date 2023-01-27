// get all text
// look for [] or other links/figures 
// add event listener somewhere else
// on hover, scan other pages for the corresponding cross reference
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

import { getPDFText } from '../meaningcloudSummary/GenerateSummary';
import { findCitations_withDOI } from '../../api/find_citations';

import * as PDFJS from 'pdfjs-dist';
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const GetText = (props) => {
  const {
    url
  } = props;

  const [fullText, setFullText] = useState('');
  const [doi, setDoi] = useState('');
  const [mappedCitations, setMappedCitations] = useState({});

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

  async function getRawData() {
    PDFJS.getDocument(url).promise.then(
      function(doc) {
        let pdfDoc = doc;   
        window.objs = []
        pdfDoc.getOperatorList().then(function (ops) {
            for (var i=0; i < ops.fnArray.length; i++) {
                if (ops.fnArray[i] === PDFJS.OPS.paintJpegXObject) {
                    window.objs.push(ops.argsArray[i][0])
                }
            }
        })
        console.log(window.args.map(function (a) { pdfDoc.objs.get(a) }))

      });
  }

  useEffect(() => {
    if(doi) {
      setMappedCitations(findCitations_withDOI(doi));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doi])


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
      <Button
        onClick={ () => getRawData() }
      >
        number 3
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