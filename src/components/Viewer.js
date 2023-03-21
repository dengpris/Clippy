
import ViewerNavbar from './viewerComponents/ViewerNavbar';
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import Sidebar from './viewerComponents/Sidebar';

import * as PDFJS from 'pdfjs-dist';
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";


PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;



const Viewer = ({pdfData, setPdfTitle}) => {
  const url = useMemo(() => {
    getPDFText();
    return URL.createObjectURL(pdfData);
  }, [pdfData])

  const canvasRef = useRef();
  const textRef = useRef();
  const [pdfRef, setPdfRef] = useState();
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomScale, setZoomScale] = useState(1.3);
  const [showSidebar, setShowSidebar] = useState(false);
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const summaryURL = 'https://api.meaningcloud.com/summarization-1.0';

  // Code from: https://stackoverflow.com/questions/64181879/rendering-pdf-with-pdf-js
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
      var renderTask = page.render(renderContext);

      renderTask.promise.then(function() {
        // Returns a promise, on resolving it will return text contents of the page
        return page.getTextContent();
    })
    .then(function(textContent) {

         // PDF canvas
        // const textLayer = textRef.current;
        var textLayer = document.querySelector(".textLayer");
        textLayer.style.left = canvas.offsetLeft + 'px';
        textLayer.style.top = canvas.offsetTop + 'px';
        textLayer.style.height = canvas.offsetHeight + 'px';
        textLayer.style.width = canvas.offsetWidth + 'px';
        console.log('henlo these are the sizes ', textLayer.style.left,textLayer.style.top, textLayer.style.height, textLayer.style.top);
        // Pass the data to the method for rendering of text over the pdf canvas.
        PDFJS.renderTextLayer({
            textContent: textContent,
            container: textLayer,
            viewport: viewport,
            textDivs: []
        });
        textLayer.setTextContent(textContent);

      });

    });   
  }, [pdfRef, zoomScale]);

    
  useEffect(() => {
    renderPage(currentPage, pdfRef);
  },[pdfRef, currentPage, renderPage]);
  // End code
    
  useEffect(() => {
    if (!url) return;

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


  async function getPDFText() {
    const result = (await axios.post('http://localhost:3001/', pdfData)).data;
    setPdfTitle(result['TITLE']);
    setBody(result['BODY_CONTENT']);
}

async function onSummaryClick() {
    const payload = new FormData()

    payload.append("key", process.env.REACT_APP_MEANINGCLOUD_API_KEY);
    payload.append("txt", body);
    payload.append("sentences", 5);

    axios.post(summaryURL, payload)
    .then((response) => {
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
  var finalSummaryArray = [];

  const TextCleaner = require('text-cleaner');
  for(let i = 0; i < summarySentencesArray.length; i++){
     summarySentencesArray[i] = (TextCleaner(summarySentencesArray[i]).condense().removeChars({ exclude: "'-,’"}).trim().valueOf()+".").replace("- ","");
     console.log(summarySentencesArray[i]);
   }
  
  for(let i = 0; i<summarySentencesArray.length;i++){
    if (checkValidSentence(summarySentencesArray[i])){
      finalSummaryArray.push(summarySentencesArray[i]);
    };
  }
  return finalSummaryArray.join(' ');
}

// Code from: https://www.geeksforgeeks.org/check-given-sentence-given-set-simple-grammer-rules/
function checkValidSentence(str){
  var len = str.length;

  if(str[0].charCodeAt(0) < "A".charCodeAt(0) ||
     str[0].charCodeAt(0) > "Z".charCodeAt(0)
    ){
      return false;
    }

  if (str[len - 1] !== "."){
    return false;
  }

  var prev_state = 0;
  var curr_state = 0;
  var index = 1;

  while (index <= str.length) {
    if (
      str[index].charCodeAt(0) >= "A".charCodeAt(0) &&
      str[index].charCodeAt(0) <= "Z".charCodeAt(0)
    )
    curr_state = 0;

    else if (str[index] === " ") curr_state = 1;

    else if (
      str[index].charCodeAt(0) >= "a".charCodeAt(0) &&
      str[index].charCodeAt(0) <= "z".charCodeAt(0)
    )
      curr_state = 2;

    else if (str[index] === ".") curr_state = 3;

    if (prev_state === curr_state && curr_state !== 2) return false;
    if (prev_state === 2 && curr_state === 0) return false;

    if (curr_state === 3 && prev_state !== 1)
            return index + 1 == str.length;

    index++;
    prev_state = curr_state;
  }
  return false;
}
// end code

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
      {/* <div className="textLayer"></div> */}
    </>
    
  );
};

Viewer.propTypes = {
  pdfData: PropTypes.instanceOf(File),
  setPdfTitle: PropTypes.func.isRequired,
};

export default Viewer;
