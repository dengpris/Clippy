import React, { useState } from 'react';
import './App.css';
import './viewer.css';
import Viewer from './components/Viewer';
import VisualizeGraph from './components/citationMapping/VisualizeGraph';
import ChooseFile from './components/viewerComponents/ChooseFile';

function App() {
  const [pdfData, setPdfData] = useState();
  const [pdfTitle, setPdfTitle] = useState();
  const [pdfAuthor, setPdfAuthor] = useState();

  return (
    <div className="App">
      <header className="App-header">
        { pdfData ?
          <>
            <Viewer
              pdfData={ pdfData }
              setPdfTitle={setPdfTitle}
              setPdfAuthor={setPdfAuthor}
            />
            {
              pdfTitle &&
              <VisualizeGraph
                pdfTitle={ pdfTitle }
                pdfAuthor={ pdfAuthor }
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
