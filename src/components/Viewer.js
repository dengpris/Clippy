
import ViewerNavbar from './viewerComponents/ViewerNavbar';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import Sidebar from './viewerComponents/Sidebar';
import myfile from '../pdfLibrary/nature12373.pdf'
import extractText from '../pdfLibrary/PDF_Test_TLDR.cermzones'
import { getPdf } from '../pdfLibrary/getPdf';

import * as PDFJS from 'pdfjs-dist';
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import * as pdfjsViewer from 'pdfjs-dist/web/pdf_viewer';
import * as pdfjsLib from 'pdfjs-dist';
PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const Viewer = (props) => {
  const {
    pdfUrl
  } = props;

  const url = getPdf(pdfUrl);
  const canvasRef = useRef();
  const [pdfRef, setPdfRef] = useState();
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomScale, setZoomScale] = useState(1.3);
  const [showSidebar, setShowSidebar] = useState(false);
  const [summary, setSummary] = useState("");
  const summaryURL = 'https://api.meaningcloud.com/summarization-1.0';

  // NOT MY CODE
  const renderPage = useCallback((pageNum, pdf=pdfRef) => {
    pdf && pdf.getPage(pageNum).then(function(page) {
      const viewport = page.getViewport({ scale: zoomScale });
      const canvas = canvasRef.current;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport: viewport
      };
      // setTimeout(page.render(renderContext), 1000);
      var renderTask = page.render(renderContext);

      renderTask.promise.then(function() {
        // Returns a promise, on resolving it will return text contents of the page
        return page.getTextContent();
    }).then(function(textContent) {
         // PDF canvas
        var textLayer = document.querySelector(".textLayer");
        textLayer.style.left = canvas.offsetLeft + 'px';
        textLayer.style.top = canvas.offsetTop + 'px';
        textLayer.style.height = canvas.offsetHeight + 'px';
        textLayer.style.width = canvas.offsetWidth + 'px';
        // Pass the data to the method for rendering of text over the pdf canvas.
        PDFJS.renderTextLayer({
            textContent: textContent,
            container: textLayer,
            viewport: viewport,
            textDivs: []
        });
      });

    });   
  }, [pdfRef, zoomScale]);
    
  useEffect(() => {
    renderPage(currentPage, pdfRef);
  },[pdfRef, currentPage, renderPage]);
  // END NOT MY CODE
    
  useEffect(() => { 
    const loadingTask = PDFJS.getDocument(url);
    loadingTask.promise.then(loadedPdf => {
      setPdfRef(loadedPdf);
      setTotalPages(loadedPdf.numPages);
    }, function (reason) {
      console.error(reason);
    });
  },[url]);


  const onZoomIn = () => zoomScale < 2 && setZoomScale(prevState => prevState + 0.1);
  const onZoomOut = () => zoomScale > 0.7 && setZoomScale(prevState => prevState - 0.1);
    
  const nextPage = () => pdfRef && currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const firstPage = () => currentPage !== 1 && setCurrentPage(1);
  const lastPage = () => currentPage < totalPages && setCurrentPage(totalPages);
  
  const toggleSidebar = () => setShowSidebar(true);
  const hideSidebar = () => setShowSidebar(false);


  // I DONT WANT THIS FUNCTION HERE
  async function getPDFText(url) {
    let doc = await PDFJS.getDocument(url).promise;
    let pageTexts = Array.from({length: doc.numPages}, async (v,i) => {
        return (await (await doc.getPage(i+1)).getTextContent()).items.map(token => token.str).join(' ');
    });
    let result = (await Promise.all(pageTexts)).join('');

    return result;
}

// ONSUMMARYCLICK SHOULD ONLY CALL GETSUMMARY FROM GENERATESUMMARY.JS, THEN SETSUMMARY STATE TO THE RESULT
// HOWEVER THAT CALLING GETSUMMARY RETURNS UNDEFINED INSTEAD OF THE SUMMARY
// CURRENTLY SOLUTION IS TO INCLUDE THE GETSUMMARY FUNCTION CALL IN VIEWER.JS, BUT I DONT LIKE THIS WORKFLOW
// const onSummaryClick = async() => {
//   getSummary(url).then(response => setSummary(response))
//   toggleSidebar();
// } NOT WORKING

async function onSummaryClick() {
    let text = await getPDFText(url)
    const payload = new FormData()
    payload.append("key", process.env.REACT_APP_MEANINGCLOUD_API_KEY);
    payload.append("txt", text);
    payload.append("sentences", 5);

    axios.post(summaryURL, payload)
    .then((response) => {
        //console.log(response.data.summary);
        setSummary(summaryTokenize(response.data.summary));
        toggleSidebar();
    })
    .catch((error) => {
        console.log('error', error);
    })
}

function summaryTokenize(summary){
  var Tokenizer = require('sentence-tokenizer');
  var tokenizer = new Tokenizer();
  tokenizer.setEntry(summary);
  console.log(tokenizer.getSentences());
  var summarySentencesArray = tokenizer.getSentences();

  const TextCleaner = require('text-cleaner');
  for(let i = 0; i < summarySentencesArray.length; i++){
    summarySentencesArray[i] = (TextCleaner(summarySentencesArray[i]).condense().removeChars({ exclude: "'-,’"}).trim().valueOf()+".").replace("- ","");
    console.log(summarySentencesArray[i]);
  }
  return summarySentencesArray.join(' ');

}
    
  return (
    <>
      <ViewerNavbar 
        url = {url}
        showSidebar={ showSidebar }
        summary = { summary }
        toggleSidebar={ toggleSidebar }
        onSummaryClick={ onSummaryClick }
        currentPage={ currentPage }
        totalPageCount={ totalPages }
        nextPage={ nextPage }
        previousPage={ prevPage }
        firstPage={ firstPage }
        lastPage={ lastPage }
        onZoomIn={ onZoomIn }
        onZoomOut={ onZoomOut }
        zoomScale={ zoomScale }
      />
      { showSidebar ? 
        <Sidebar 
          summary={ summary }
          hideSidebar={ hideSidebar }
        /> 
        : null
      }
      <canvas id='viewer-canvas' ref={ canvasRef }></canvas>
      <div className="textLayer"></div>
    </>
    
  );
};

Viewer.propTypes = {
  pdfUrl: PropTypes.string
};

export default Viewer;
