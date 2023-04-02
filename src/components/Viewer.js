
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
  const [summaryArray, setSummaryArray] = useState([]);
  const [body, setBody] = useState("");
  const [abstract, setAbstract] = useState("not ready");
  const summaryURL = 'https://api.meaningcloud.com/summarization-1.0';
  const [textContent, setTextContent] = useState();
  const [viewport, setViewport] = useState();
  
  const summary = useMemo(() => {
    return summaryArray.join(' ');
  }, [summaryArray]);

  // Code from: https://stackoverflow.com/questions/64181879/rendering-pdf-with-pdf-js
  const renderPage = useCallback((pageNum, pdf=pdfRef) => {
    pdf && pdf.getPage(pageNum).then(function(page) {
      const viewport = page.getViewport({ scale: zoomScale });
      setViewport(viewport);
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
      setTextContent(textContent);
      });
    });   
  }, [pdfRef, zoomScale]);

  useEffect(() => {
    if (!textContent || !viewport) {
      return;
    }
    const textLayer = document.querySelector(".textLayer");
    // Clear previous textlayer on page or zoom change
    textLayer.innerHTML = "";
    const canvas = canvasRef.current;

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
    }).promise.then(() => {
      if (showSidebar) { highlightSummary(textLayer); }
    });
  }, [textContent, viewport, summaryArray]);
    
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
  const hideSidebar = () => {
    setShowSidebar(false);
    const textLayer = document.querySelector(".textLayer")
    removeHighlight(textLayer);
  }

  async function getAbstract(pdfTitle){
    let doiRequest = 'https://api.crossref.org/works?query.title=' + pdfTitle;
    const doi = (await axios.get(doiRequest)).data.message.items[0].DOI;
    let abstractRequest = 'https://api.semanticscholar.org/graph/v1/paper/' + doi + '?fields=abstract';
    let abstract_temp = (await axios.get(abstractRequest)).data.abstract;
    if(abstract_temp == null){
      abstract_temp = "";
    }
    setAbstract(abstract_temp);
    console.log("done getting abstract");
    //return abstract_temp;
  }

async function getPDFText() {
    const result = (await axios.post('http://localhost:3001/', pdfData)).data;
    setPdfTitle(result['TITLE']);
    setBody(result['BODY_CONTENT']);
    getAbstract(result['TITLE']);
    //setAbstract(abstract_temp1);
}

async function onSummaryClick() {
    if (summary != "") { 
      toggleSidebar();
      return; 
    }
    const payload = new FormData()
    payload.append("key", process.env.REACT_APP_MEANINGCLOUD_API_KEY);
    payload.append("txt", body);
    //When testing summary, use number of sentences equal to abstract.
    payload.append("sentences", 5);

    axios.post(summaryURL, payload)
    .then((response) => {
        console.log(abstract);
        var reference_summary = abstract;
        var generated_summary = summaryTokenize(response.data.summary);
        setSummaryArray(generated_summary);
        console.log(summaryArray);
        toggleSidebar();
        let rouge_scores = getRougeScore(reference_summary, generated_summary);
        //ROUGE Scores output to console
        console.log("Rouge Score - Unigram: ", rouge_scores[0]);
        console.log("Rouge Score - Bigram: ", rouge_scores[1]);
        console.log("Rouge Score - Trigram: ", rouge_scores[2]);
    })
    .catch((error) => {
        console.log('error', error);
    })
}

//Calculates the ROUGE score for the given summary
function getRougeScore(reference_summary, generated_summary){
  var rouge = require('rouge');
  var rouge_score_unigram = rouge.n(generated_summary,reference_summary,1);
  var rouge_score_bigram = rouge.n(generated_summary,reference_summary,2);
  var rouge_score_trigram = rouge.n(generated_summary,reference_summary,3);
  return [rouge_score_unigram, rouge_score_bigram, rouge_score_trigram];
}

function highlightSummary(textLayer) {
  const textLines = textLayer.getElementsByTagName("span");

  for (let sentenceIdx = 0; sentenceIdx < summaryArray.length; sentenceIdx++) {
    let currentLine = 0;
    const sentence = summaryArray[sentenceIdx];
    console.log('searching for ' + sentence);
    const words = sentence.split(' ');
    let currentWord = 0;

    const highlightLines = [];
    while (currentWord < words.length && currentLine < textLines.length) {
      const wordsInLine = textLines[currentLine].textContent.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').split(' ');
      const textLine = textLines[currentLine].cloneNode();

      let matched = false;
      for (let wordIdx = 0; wordIdx < wordsInLine.length; wordIdx++) {
        const word = wordsInLine[wordIdx];
        if (currentWord === words.length) {
          matched = true;
          // need to add unhighlighted words following this wordw
          textLine.innerHTML += wordsInLine.slice(wordIdx).join(" ");
          highlightLines.push(textLine);
          break;
        }

        matched = word === words[currentWord];
        if (!matched && wordIdx == wordsInLine.length - 1) { // last word on a line may contain a hyphen
          if (word[word.length - 1] === '-' && word.slice(0, word.length - 1) === words[currentWord].slice(0, word.length - 1)) {
            matched = true;
            words[currentWord] = words[currentWord].slice(word.length - 1); 
            currentWord--;
          }
        }

        if (matched) {
          if (currentWord == 0) {
            // first word found, need to add unhighlighted words in this line
            textLine.textContent = wordsInLine.slice(0, wordIdx).join(" ");
          }
          const highlightNode = document.createElement("mark");
          highlightNode.style.backgroundColor = 'yellow';
          highlightNode.style.color ='transparent';
          highlightNode.textContent = wordsInLine[wordIdx];
          textLine.append(highlightNode);
          currentWord++;
        } else if (currentWord !== 0) {
          console.log('terminated');
          currentWord = 0;
          matched = false;
          highlightLines.length = 0;
        }
      }
      if (!matched) {
        textLine.remove();
      } else {
        highlightLines.push(textLine);
      }
      currentLine++;
    }
    for (const line of highlightLines) {
      textLayer.append(line);
    }
  }
}

function removeHighlight(textLayer) {
  const highlightedWords = textLayer.getElementsByTagName('mark');
  for (let words of highlightedWords) {
    words.style.backgroundColor = 'transparent';
  }
}

//Tokenizes summary into sentences with proper formatting.
function summaryTokenize(summary){
  //Using new tokenizer for cleaner sentence parsing
  var tokenizer = require('sbd');
  console.log(tokenizer.sentences(summary));
  var summarySentencesArray = tokenizer.sentences(summary);
  var finalSummaryArray = [];

  const TextCleaner = require('text-cleaner');
  for(let i = 0; i < summarySentencesArray.length; i++){
     summarySentencesArray[i] = (TextCleaner(summarySentencesArray[i]).condense().removeChars({ exclude: "'-,’"}).trim().valueOf()+".").replace("- ","");
   }
  
  //Checking for valid sentences and removes sentences that are not valid sentences.
  for(let i = 0; i<summarySentencesArray.length;i++){
    if (checkValidSentence(summarySentencesArray[i])){
      finalSummaryArray.push(summarySentencesArray[i]);
    }
  }
  //console.log(finalSummaryArray);
  return finalSummaryArray;
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
      <div className="textLayer"></div>
    </>
    
  );
};

Viewer.propTypes = {
  pdfData: PropTypes.instanceOf(File),
  setPdfTitle: PropTypes.func.isRequired,
};

export default Viewer;
