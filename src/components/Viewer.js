
import ViewerNavbar from './viewerComponents/ViewerNavbar';
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Button } from 'react-bootstrap';

import Sidebar from './viewerComponents/Sidebar';
import CrossRef from './hovering/CrossRef';

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
  const [summaryArray, setSummaryArray] = useState([]);
  const [body, setBody] = useState("");
  const [cerm_abstract, setCermAbstract] = useState("");
  const [abstract, setAbstract] = useState("not ready");
  const summaryURL = 'https://api.meaningcloud.com/summarization-1.0';
  const [references, setReferences] = useState([])
  const [start, setStart] = useState()
  const [end, setEnd] = useState()
  const [lastRef, setLastRef] = useState(0)
  const [gotRef, setGotRef] = useState(false)
  const [textContent, setTextContent] = useState();
  const [viewport, setViewport] = useState();
  const [showCrossRef, setShowCrossRef] = useState(false)
  const [pageRefs, setPageRefs] = useState([])
  const [allPageContent, setAllPageContent] = useState([])
  const [crossRefInfo, setCrossRefInfo] = useState([])
  
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

      let combinedText = '';
      for (let i = 0; i < textContent.items.length; i++) {
        const textItem = textContent.items[i];
        combinedText += textItem.str;
      }

      var citationRefs = getCitationRefs(textContent)
      var squareRefs = getSquareCitations(combinedText)
      if(squareRefs.length > 0) {
        citationRefs = []
      }
      var figureRefs = getFigureRefs(textContent)
      // console.log('refs are ', citationRefs, squareRefs, figureRefs)
      setPageRefs(citationRefs.concat(squareRefs).concat(figureRefs))
      setEnd(Date.now())

      });
    });   
  }, [pdfRef, zoomScale]);

  function hideCrossRefInfo () {
    setShowCrossRef(false)
  }


  function onCrossRefClick () {
    // console.log('cross refs are ', allPageContent)

    const referenceRegex = /(References|Bibliography)/i;
    for(let i = 0; i < allPageContent.length; i++) {
      let combinedText = '';
      for (let j = 0; j < allPageContent[i].items.length; j++) {
        const textItem = allPageContent[i].items[j];
        combinedText += textItem.str;
        if (referenceRegex.test(combinedText)) {
          getReferences(combinedText, i)
        }
        if(currentPage > lastRef && gotRef) {
          getReferences(combinedText, i)
        }
      }
    }
    
    const result = [];

    for (let i = 0; i < pageRefs.length; i++) {
      const match = references.find(str => str.startsWith(`[${pageRefs[i]}]`));
      result.push(match);
    }
    console.log('results are ', result)
    setCrossRefInfo(result)
    setShowCrossRef(true)
  }


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
    // console.log('got these references', tmpRef)
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

      const pagePromises = []

      for (let i = 1; i <= loadedPdf.numPages; i++) {
        const pagePromise = loadedPdf.getPage(i).then(function(page) {
          return page.getTextContent();
        });
        pagePromises.push(pagePromise);
      }

      Promise.all(pagePromises).then(function(newPages) {
        setAllPageContent(prevPages => [...prevPages, ...newPages]);
      });

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
  

  const toggleSidebar = () => {
    setShowSidebar(true);
    const textLayer = document.querySelector(".textLayer");
    highlightSummary(textLayer);
  }

  const hideSidebar = () => {
    setShowSidebar(false);
    const textLayer = document.querySelector(".textLayer")
    removeHighlight(textLayer);
  }

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
    setCermAbstract(result['ABSTRACT']);
    getAbstract(result['TITLE']);
    //setAbstract(abstract_temp1);
}

async function onSummaryClick() {
    if (summary != "") { 
      toggleSidebar();
      return; 
    }
    const payload = new FormData()
    var numSentences = 0;
    //Set to 1 if Verifying ROUGE Scores
    var summaryVerificationFlag = 0;
    if (summaryVerificationFlag && abstract != ""){
      var tokenizer = require('sbd');
      console.log(tokenizer.sentences(abstract));
      var numAbstractArray = tokenizer.sentences(abstract);
      numSentences = numAbstractArray.length;
      //Using abstract in body for testing summarizer
      var new_body = cerm_abstract + body;
      var formattedBodyArray = summaryTokenize(new_body);
      var formatted_body = removeInvalidSentence(formattedBodyArray).join(' ');
    }
    else{
      numSentences = 8;
      //Tokenizes body into sentence array.
      var formattedBodyArray = summaryTokenize(body);
      //Removes invalid sentences from body text to be put in summarizer.
      var formatted_body = removeInvalidSentence(formattedBodyArray).join(' ');
      //console.log(formatted_body);
    }
    payload.append("key", process.env.REACT_APP_MEANINGCLOUD_API_KEY);
    payload.append("txt", formatted_body);
    //When testing summary, use number of sentences equal to abstract.
    payload.append("sentences", numSentences);

    axios.post(summaryURL, payload)
    .then((response) => {

        console.log(abstract);
        var reference_summary;
        //No abstract available
        if(abstract == ""){
          var abstractBodyArray = summaryTokenize(body);
          var newAbstractArray = [];
          for(let i = 0; i < numSentences; i++){
            newAbstractArray.push(abstractBodyArray[i]);
          }
          //console.log(newAbstractArray);
          reference_summary = newAbstractArray.join(' ');
        }
        //Abstract available
        else{
          reference_summary = abstract;
        }
        //console.log(response.data.summary)
        //Tokenizes summary but does not remove improper sentences.
        var generated_summary = summaryTokenize(response.data.summary);
        setSummaryArray(generated_summary);
        //console.log(generated_summary);

        toggleSidebar();
        //For ROUGE score verification...
        //if(summaryVerificationFlag){
          let rouge_scores = getRougeScore(reference_summary, generated_summary.join(' '));
          //ROUGE Scores output to console
          console.log("Rouge Score - Unigram: ", rouge_scores[0]);
          console.log("Rouge Score - Bigram: ", rouge_scores[1]);
          console.log("Rouge Score - Trigram: ", rouge_scores[2]);
        //}
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

      // If span only has numbers, brackets, or [.,-], assume it is a super/subscript and skip it
      if (textLines[currentLine].textContent.match(/^[\d\.\,\-\–\[\]\(\)\{\}]+$/)) { 
        currentLine++;
        continue;
      }

      const wordsInLine = textLines[currentLine].textContent.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').split(' ');
      const textLine = textLines[currentLine].cloneNode();

      let matched = false;
      for (let wordIdx = 0; wordIdx < wordsInLine.length; wordIdx++) {
        const word = wordsInLine[wordIdx];

        if (!word) { continue; }
        if (currentWord === words.length) {
          matched = true;
          // need to add unhighlighted words following this word

          textLine.innerHTML += wordsInLine.slice(wordIdx).join(" ");
          highlightLines.push(textLine);
          break;
        }

        
        matched = word === words[currentWord];
        // Sometimes textContent will lack a period
        if (words[currentWord].replace(word, '').match(/^[\.\?\!]*$/)) { matched = true; }

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
  
  //console.log(summarySentencesArray);
  return summarySentencesArray;
}

function removeInvalidSentence(summarySentencesArray){
    var tempSentenceArray = [];
    //Checking for valid sentences and removes sentences that are not valid sentences.
    for(let i = 0; i<summarySentencesArray.length;i++){
      if (checkValidSentence(summarySentencesArray[i])){
        tempSentenceArray.push(summarySentencesArray[i]);
      }
    }
    return tempSentenceArray;

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
        onCrossRefClick={ onCrossRefClick }
        crossRefInfo={ crossRefInfo }
      />
      { showSidebar ? 
        <Sidebar 
          summary={ summary }
          hideSidebar={ hideSidebar }
        /> 
        : null
      }
      {
        showCrossRef ?
        <CrossRef
          info={ crossRefInfo }
          setShowCrossRef={ setShowCrossRef }
        /> : null
      }
      <canvas id='viewer-canvas' ref={ canvasRef }></canvas>
      <div className="textLayer"></div>
    </>
    
  );
};

Viewer.propTypes = {
  pdfData: PropTypes.instanceOf(File),
  setPdfTitle: PropTypes.func.isRequired,
  setPdfAuthor: PropTypes.func.isRequired
};

export default Viewer;