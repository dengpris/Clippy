import React, { useEffect } from 'react';
import * as pdfjsLib from '../../../public/build/pdf';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;



export default class PDFViewer extends React.Component {
  constructor(props) {
    super(props);
    this.viewerRef = React.createRef();
    this.backend = new props.backend();
    this.PDFToText = this.PDFToText.bind(this);
  }

  componentDidMount() {
    const { src } = this.props;
    const element = this.viewerRef.current;

    this.backend.init(src, element);
  }
  
  async PDFToText() {
    console.log('meh');
    let doc = await pdfjsLib.getDocument('./pdf-test.pdf').promise;
    let pageTexts = Array.from({length: doc.numPages}, async (v,i) => {
        return (await (await doc.getPage(i+1)).getTextContent()).items.map(token => token.str).join('');
    });
    let result= (await Promise.all(pageTexts)).join('');
    console.log(result);
  }

  render() {
    return (
      <div ref={this.viewerRef} id='viewer' style={{ width: '100%', height: '100%' }} >
      <button onClick={this.PDFToText}> 
        bleh
      </button>
      </div>
    )
  }
}