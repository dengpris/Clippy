import React, { Component } from 'react';
import './App.css';
import PDFViewer from './components/PDFViewer/PDFViewer';
import PDFJSBackend from './backends/pdfjs';
import SemanticScholarAPI from './backends/SemanticScholarAPI';
import NavBar from './components/NavBar';

class App extends Component {
  render() {
    return (
      <div className="App">
        {/* <PDFViewer 
          backend={ PDFJSBackend }
          src='/2022604_Draft_Proposal.pdf'
        /> */}
        <NavBar/>
      <SemanticScholarAPI/>
      </div>
    );
  }
}

export default App;