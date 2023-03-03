
import * as PDFJS from 'pdfjs-dist';
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// get superscripts
export async function getTitle (url) {
  PDFJS.getDocument(url).promise.then(
    function(doc) {
      let pdfDoc = doc;   
      pdfDoc.getMetadata().then(function(data) {
        console.log(data);
        return(data.info.Title);
      }).catch(function(err) {
        console.log('Error getting meta data');
        console.log(err);
        return;
      });
    }).catch(function(err) {
      console.log('Error getting PDF from ' + url);
      console.log(err);
      return;
  });
  return;
};