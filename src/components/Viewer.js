
import ViewerNavbar from './viewerComponents/ViewerNavbar';
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Button } from 'react-bootstrap';

import Sidebar from './viewerComponents/Sidebar';

import * as PDFJS from 'pdfjs-dist';
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";


PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;



const Viewer = ({pdfData, setPdfTitle, setPdfAuthor}) => {
  const url = useMemo(() => {
    getPDFText();
    return URL.createObjectURL(pdfData);
  }, [pdfData])

  const canvasRef = useRef();
  const textLayerRef = useRef();
  const [pdfRef, setPdfRef] = useState();
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomScale, setZoomScale] = useState(1.3);
  const [showSidebar, setShowSidebar] = useState(false);
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState(null);
  const [abstract, setAbstract] = useState("not ready");
  const summaryURL = 'https://api.meaningcloud.com/summarization-1.0';
  const [references, setReferences] = useState([])
  const [start, setStart] = useState()
  const [end, setEnd] = useState()
  const [lastRef, setLastRef] = useState(0)
  const [gotRef, setGotRef] = useState(false)

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
        const textLay = textLayerRef.current
        while(textLay.firstChild) {
          textLay.removeChild(textLay.firstChild)
        }
        // console.log('got this text content ', textContent)

        // PDF canvas
        // const textLayer = textRef.current;
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

        // textLayer.setTextContent(textContent);

        let combinedText = '';
        for (let i = 0; i < textContent.items.length; i++) {
          const textItem = textContent.items[i];
          combinedText += textItem.str;
        }

        // console.log('combined text is ', combinedText)

        var citationRefs = getCitationRefs(textContent)
        var squareRefs = getSquareCitations(combinedText)
        var figureRefs = getFigureRefs(textContent)
        
        const referenceRegex = /(References|Bibliography)/i;
        if (referenceRegex.test(combinedText)) {
          getReferences(combinedText, pageNum)
        }
        if(currentPage > lastRef && gotRef) {
          getReferences(combinedText, pageNum)
        }
    

        setEnd(Date.now())

      });
    });   
  }, [pdfRef, zoomScale]);

  function findMaxReferenceNumber(text) {
    const regex = /\[(\d+)\]|\b(\d+)\.\s/mg;
    let match;
    let maxNumber = 0;

    while ((match = regex.exec(text)) !== null) {
      const number = match[1] || match[2];
      if (number > maxNumber) {
        maxNumber = number;
      }
    }
    return maxNumber
  }


  const getReferences = (combinedText, pageNum) => {
    // for 1.ref 2.ref format
    const refRegex = /(\d+)\.\s(.*?)(?=\d+\.\s|$)/g;
    const refMatches = combinedText.matchAll(refRegex);
    var allReferences = [];

    for(const match of refMatches) {
      const index = match[1];
      const reference = match[2];
      allReferences.push(`[${index}] ${reference}`);
    }

    // in format of [1] author, [2] author, etc
    var allReferences2 = []
    const squareRegex = /\[(\d+)\]\s*(.+?)(?=\[\d+\]|$)/gs;
    const squareMatches = [...combinedText.matchAll(squareRegex)];
    allReferences2 = squareMatches.map(match => `[${match[1]}] ${match[2].trim()}`);
    allReferences = allReferences.concat(allReferences2)
    var tmpRef = references
    for(let i = 0; i < allReferences.length; i++) {
      if(!references.includes(allReferences[i])) {
        tmpRef.push(allReferences[i])
      }
    }
    setReferences(tmpRef)
    setLastRef(pageNum)
    setGotRef(true)
  }

  const getCitationRefs = (textContent) => {
    let matches = []; // for superscripts
    const citationRegex = /\b\w+(?:\d+|[^\d\s]*\d+[^\d\s]*)\b/
    for (let i = 0; i < textContent.items.length; i++) {
      const textItem = textContent.items[i];
      if (textItem.str.match(citationRegex) && textItem.transform[0] > 0) {
        matches.push(textItem.str);
      }
    }
    const citationArr = []
    // in-text citations
    for(let i = 0; i < matches.length; i++) {
      const thing = matches[i].split(',')
      for(let j = 0; j < thing.length; j++) {
        if(Number.isInteger(+thing[j])) {
          if(!citationArr.includes(thing[j])) {
            citationArr.push(thing[j])
          }
          
        }
      }
    }
    for(let i = 0; i < matches.length; i++) {
      const thing = matches[i].split('–')
      for(let j = 0; j < thing.length; j++) {
        if(Number.isInteger(+thing[j])) {
          if(!citationArr.includes(thing[j])) {
            citationArr.push(thing[j])
          }
          
        }
      }
    }
    return citationArr
  }

  const getSquareCitations = (combinedText) => {
    const referencesRegex = /\[\s*\d+(?:\s*,\s*\d+)*\s*\]/g
    const referencesMatches = [...combinedText.matchAll(referencesRegex)];
    const referencesArr = referencesMatches.map(match => match[0]).filter(x => x);
    
    const squareRefArr = [];
    
    for (let i = 0; i < referencesArr.length; i++) {
      const refs = referencesArr[i].match(/\d+/g);
      if(refs) {
        for (let j = 0; j < refs.length; j++) {
          if(!squareRefArr.includes(parseInt(refs[j]))) {
            squareRefArr.push(parseInt(refs[j]));
          }
        }
      }
    }
    return squareRefArr
  }

  const getFigureRefs = (textContent) => {
    var matches = []
    // const figureRegex = /(Fig(?:ure)?\.?\s*\d+[a-z]?)/gi

    const figureRegex = /\b(Fig(?:\.|ure) \d+[a-z]?)/g;
    for (let i = 0; i < textContent.items.length; i++) {
      const textItem = textContent.items[i];
      if (textItem.str.match(figureRegex) && textItem.transform[0] > 0) {
        matches.push(textItem.str);
      }
    }
        
    const figureArr = []
    for(let i = 0; i < matches.length; i++) {
      const individuals = [...matches[i].matchAll(figureRegex)].map(match => match[1])
      // console.log(individuals)
      if(!figureArr.includes(individuals[0])) {
        figureArr.push(individuals[0])
      }
    }
    return figureArr
  }
  

  // const getReferences = useCallback((pageNum, pdf=pdfRef) => {
  //   pdf && pdf.getPage(pageNum).then(function(page) {
  //     return page.getTextContent()
  //   })
  //   .then(function(textContent) {
  //     console.log('textContent for page ', pageNum)
  //     console.log('text content is ', textContent)
  //   })
  // })

  // useEffect(() => {
  //   for(let i = 0; i < totalPages; i++) {
  //     getReferences(i)
  //   }
  // }, [getReferences, totalPages])

  useEffect(() => {
    if(start && end) {
      // console.log('Time taken is ', (end-start)/1000)
    }
  }, [start, end])

    
  useEffect(() => {
    setStart(Date.now())
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

  async function getAbstract(pdfTitle){
    // let doiRequest = 'https://api.crossref.org/works?query.title=' + pdfTitle;
    // const doi = (await axios.get(doiRequest)).data.message.items[0].DOI;
    // let abstractRequest = 'https://api.semanticscholar.org/graph/v1/paper/' + doi + '?fields=abstract';
    // let abstract_temp = (await axios.get(abstractRequest)).data.abstract;
    // if(abstract_temp == null){
    //   abstract_temp = "";
    // }
    let abstract_temp = pdfTitle;
    setAbstract(abstract_temp);
    console.log("done getting abstract");
    //return abstract_temp;
  }

  async function getPDFText() {
    const result = (await axios.post('http://localhost:3001/', pdfData)).data;
    console.log(result);
    setPdfTitle(result['TITLE']); 
    const author = result['AUTHOR'].replace(/[0-9]/g, '').replace('*','').split(",");
    setPdfAuthor(author);
    setBody(result['BODY_CONTENT']);
    getAbstract(result['TITLE']);
    //setAbstract(abstract_temp1);
}

async function onSummaryClick() {
    if (summary != "") { 
      toggleSidebar();
      return; 
    }
    console.log(abstract);
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
      <div className="textLayer" ref={ textLayerRef }></div>
      {/* <GetImages /> */}
    </>
    
  );
};

Viewer.propTypes = {
  pdfData: PropTypes.instanceOf(File),
  setPdfTitle: PropTypes.func.isRequired,
  setPdfAuthor: PropTypes.func.isRequired
};

export default Viewer;