import React, { useState } from 'react';
import './App.css';
import Viewer from './components/Viewer';
import VisualizeGraph from './components/citationMapping/VisualizeGraph';
import ChooseFile from './components/viewerComponents/ChooseFile';

function App() {
  const [pdfUrl, setPdfUrl] = useState();

  return (
    <div className="App">
      <header className="App-header">
        { pdfUrl ?  
          <>
            <Viewer
              pdfUrl={ pdfUrl }
            />
            <VisualizeGraph/>
          </>
        : 
          <ChooseFile
            setPdfUrl={ setPdfUrl }
          />
        }
      </header>
    </div>
  );
}


export default App;
