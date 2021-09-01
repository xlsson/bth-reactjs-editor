import { useState } from 'react';
import ReactQuill from 'react-quill';
import './App.css';
import 'react-quill/dist/quill.bubble.css';

function App() {
  const [value, setValue] = useState('');

  function saveContent() {
    console.log(value);
  }

  return (
    <div className="App">
        <div className="toolbar">
            <div className="toolbarButton" onClick={saveContent}>Spara</div>
        </div>
      <div className="editorContainer">
        <ReactQuill theme="bubble" value={value} onChange={setValue}/>
      </div>
    </div>
  );
}

export default App;
