import axios from 'axios';
import * as PDFJS from 'pdfjs-dist';
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

const summaryURL = 'https://api.meaningcloud.com/summarization-1.0';
PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function getPDFText(url) {
    let doc = await PDFJS.getDocument(url).promise;
    let pageTexts = Array.from({length: doc.numPages}, async (v,i) => {
        return (await (await doc.getPage(i+1)).getTextContent()).items.map(token => token.str).join(' ');
    });
    let result = (await Promise.all(pageTexts)).join('');

    return result;
}

export async function getSummary(url) {
    let text = await getPDFText(url)

    const payload = new FormData()
    payload.append("key", process.env.REACT_APP_MEANINGCLOUD_API_KEY);
    payload.append("txt", text);
    payload.append("sentences", 5);

    axios.post(summaryURL, payload)
    .then((response) => {
        console.log(response.data.summary);
        return (response.data.summary);
    })
    .catch((error) => {
        console.log('error', error);
    })
}