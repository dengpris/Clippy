import React, { useState } from 'react';
import './App.css';
import './viewer.css';
import Viewer from './components/Viewer';
import VisualizeGraph from './components/citationMapping/VisualizeGraph';
import ChooseFile from './components/viewerComponents/ChooseFile';

function App() {
  const [pdfData, setPdfData] = useState();
  const [pdfTitle, setPdfTitle] = useState();

  return (
    <div className="App">
      <header className="App-header">
        { pdfData ?
          <>
            <Viewer
              pdfData={ pdfData }
              setPdfTitle={setPdfTitle}
            />
            {
              pdfTitle &&
              <VisualizeGraph
                pdfTitle={ pdfTitle }
              />
            }

          </>
        : 
          <ChooseFile
            setPdfData={ setPdfData }
          />
        }
      </header>
    </div>
  );
}


export default App;
