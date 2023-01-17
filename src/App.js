import './App.css';
import './viewer.css';
import Viewer from './components/Viewer';
import VisualizeGraph from './components/citationMapping/VisualizeGraph';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Viewer/>
        <VisualizeGraph/>
      </header>
    </div>
  );
}


export default App;
