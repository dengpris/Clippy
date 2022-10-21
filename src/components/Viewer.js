import myfile from './Draft_Proposal.pdf'
import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as PDFJS from 'pdfjs-dist';
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const Viewer = () => {
  const url = myfile
  const canvasRef = useRef();
  const [pdfRef, setPdfRef] = useState();
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const renderPage = useCallback((pageNum, pdf=pdfRef) => {
    pdf && pdf.getPage(pageNum).then(function(page) {
      const viewport = page.getViewport({scale: 1.5});
      const canvas = canvasRef.current;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport: viewport
      };
      page.render(renderContext);
    });   
  }, [pdfRef]);
    
  useEffect(() => {
    renderPage(currentPage, pdfRef);
  },[pdfRef, currentPage, renderPage]);
    
  useEffect(() => { 
    const loadingTask = PDFJS.getDocument(url);
    loadingTask.promise.then(loadedPdf => {
      setPdfRef(loadedPdf);
    }, function (reason) {
      console.error(reason);
    });
  },[url]);
    
  const nextPage = () => pdfRef && currentPage < pdfRef.numPages && setCurrentPage(currentPage + 1);
    
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
    
  return (
    <>
      <canvas ref={ canvasRef }></canvas>
      {/* <br/>
      <span>Page { currentPage } of { pdfRef.numPages }</span>
      <button onClick={ () => prevPage() }>Previous Page</button>
      <button onClick={ () => nextPage() }>Next Page</button> */}
    </>
    
  );
};

export default Viewer;