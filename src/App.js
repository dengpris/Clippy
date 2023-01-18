import React, { useState } from 'react';
import './App.css';
import Viewer from './components/Viewer';
import VisualizeGraph from './components/citationMapping/VisualizeGraph';
import ChooseFile from './components/viewerComponents/ChooseFile';

function App() {
  const [pdfUrl, setPdfUrl] = useState();
  const [pdfTitle, setPdfTitle] = useState();

  return (
    <div className="App">
      <header className="App-header">
        { pdfUrl ?  
          <>
            <Viewer
              pdfUrl={ pdfUrl }
            />
            <VisualizeGraph
              pdfTitle={ pdfTitle }
            />
          </>
        : 
          <ChooseFile
            setPdfUrl={ setPdfUrl }
            setPdfTitle={ setPdfTitle }
          />
        }
      </header>
    </div>
  );
}


export default App;
