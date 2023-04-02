import React, { useState } from 'react';
import './App.css';
import './viewer.css';
import Viewer from './components/Viewer';
import VisualizeGraph from './components/citationMapping/VisualizeGraph';
import ChooseFile from './components/viewerComponents/ChooseFile';

function App() {
  const [pdfData, setPdfData] = useState();
  const [pdfTitle, setPdfTitle] = useState();
  const [graphClicked, setGraphClicked] = useState(false);

  return (
    <div className="App">
      <header className="App-header">
        { pdfData ?
          <>
            <Viewer
              pdfData={ pdfData }
              setPdfTitle={setPdfTitle}
              setGraphClicked={setGraphClicked}
            />
            {
              pdfTitle &&
              <VisualizeGraph
                pdfTitle={ pdfTitle }
                graphClicked = {graphClicked}
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
