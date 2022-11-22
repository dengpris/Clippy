import logo from './logo.svg';
import './App.css';
import Viewer from './components/Viewer';
import { searchByKeyWord } from './api/semanticScholarAPI';
import DisplayCards from './components/semanticScholar/DisplayCards';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a> */}
        <Viewer/>
        <button onClick={() => console.log('return ', searchByKeyWord()) }>click me</button>
      </header>
    </div>
  );
}


export default App;
