import React, { Component } from 'react';
import './App.css';
import PDFViewer from './components/PDFViewer/PDFViewer';
import PDFJSBackend from './backends/pdfjs';

var text = `We introduce TLDR generation, a new form 
of extreme summarization, for scientific papers. TLDR generation involves high source
compression and requires expert background
knowledge and understanding of complex
domain-specific language. To facilitate study
on this task, we introduce SCITLDR, a new
multi-target dataset of 5.4K TLDRs over 3.2K
papers. SCITLDR contains both author-written
and expert-derived TLDRs, where the latter
are collected using a novel annotation protocol that produces high-quality summaries
while minimizing annotation burden. We propose CATTS, a simple yet effective learning strategy for generating TLDRs that exploits titles as an auxiliary training signal.
CATTS improves upon strong baselines under both automated metrics and human evaluations.`

const formdata = new FormData();
formdata.append("key", process.env.REACT_APP_MEANINGCLOUD_API_KEY);
formdata.append("txt", text);
formdata.append("sentences", 2);

const requestOptions = {
  method: 'POST',
  body: formdata,
  redirect: 'follow'
};

fetch("https://api.meaningcloud.com/summarization-1.0", requestOptions)
  .then(response => ({
    status: response.status, 
    body: response.json()
  }))
  .then(({ status, body }) => console.log(status, body))
  .catch(error => console.log('error', error));

class App extends Component {
  render() {
    return (
      <div className="App">
        <PDFViewer 
          backend={PDFJSBackend}
          src='/2022604_Draft_Proposal.pdf'
        />
      </div>
    );
  }
}

export default App;