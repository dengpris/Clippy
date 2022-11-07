import * as pdfjsLib from '../build/pdf';
import axios from 'axios';
require('dotenv').config();
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

document.getElementById("summary").addEventListener("click", PDFToText);

async function PDFToText() {
    let doc = await pdfjsLib.getDocument('./pdf-test.pdf').promise;
    let pageTexts = Array.from({length: doc.numPages}, async (v,i) => {
        return (await (await doc.getPage(i+1)).getTextContent()).items.map(token => token.str).join(' ');
    });
    let result= (await Promise.all(pageTexts)).join('');
    console.log(result);

    var payload = new FormData();
    payload.append('key', process.env.REACT_APP_MEANINGCLOUD_API_KEY);
    console.log(process.env.REACT_APP_MEANINGCLOUD_API_KEY);
    payload.append('txt', result);
    payload.append('sentences', 1);

    axios.post(`https://api.meaningcloud.com/summarization-1.0`, payload)
    .then((response) => (
      console.log(response.data)))
    .catch(error => console.log('error', error))
  }

