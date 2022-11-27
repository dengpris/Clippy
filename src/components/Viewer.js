// import myfile from './Draft_Proposal.pdf'
import myfile from '../pdfLibrary/sample.pdf'
import ViewerNavbar from './viewerComponents/ViewerNavbar';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Sidebar from './viewerComponents/Sidebar';
import * as PDFJS from 'pdfjs-dist';
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
// import { getSummary } from './meaningcloudSummary/GenerateSummary';
import axios from 'axios';
PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const Viewer = () => {
  const url = myfile
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
      page.render(renderContext);
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

  async function getPDFText(url) {
    let doc = await PDFJS.getDocument(url).promise;
    let pageTexts = Array.from({length: doc.numPages}, async (v,i) => {
        return (await (await doc.getPage(i+1)).getTextContent()).items.map(token => token.str).join(' ');
    });
    let result = (await Promise.all(pageTexts)).join('');

    return result;
}

  async function onSummaryClick() {
    let text = await getPDFText(url)

    const payload = new FormData()
    payload.append("key", process.env.REACT_APP_MEANINGCLOUD_API_KEY);
    payload.append("txt", text);
    payload.append("sentences", 5);

    axios.post(summaryURL, payload)
    .then((response) => {
        console.log(response.data.summary);
        setSummary(response.data.summary);
        toggleSidebar();
    })
    .catch((error) => {
        console.log('error', error);
    })
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
      {showSidebar ? <Sidebar summary={summary}/> : null}
      <canvas id='viewer-canvas' ref={ canvasRef }></canvas>
    </>
    
  );
};

export default Viewer;