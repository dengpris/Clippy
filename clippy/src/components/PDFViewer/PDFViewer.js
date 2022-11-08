import React, { useEffect } from 'react';
import axios from 'axios';
import * as pdfjsLib from '../../../public/build/pdf';
require('dotenv').config();
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
    let doc = await pdfjsLib.getDocument('./pdf-test.pdf').promise;
    let pageTexts = Array.from({length: doc.numPages}, async (v,i) => {
        return (await (await doc.getPage(i+1)).getTextContent()).items.map(token => token.str).join(' ');
    });
    let result= (await Promise.all(pageTexts)).join('');
    console.log(result);

    var payload = new FormData();
    payload.append('key', process.env.REACT_APP_MEANINGCLOUD_API_KEY);
    console.log(process.env.REACT_APP_MEANINGCLOUD_API_KEY);
    payload.append('txt', result);
    payload.append('sentences', 1);

    axios.post(`https://api.meaningcloud.com/summarization-1.0`, payload)
    .then((response) => (
      console.log(response.data)))
    .catch(error => console.log('error', error))
  }

  render() {
    return (
      <div ref={this.viewerRef} id='viewer' style={{ width: '100%', height: '100%' }} >
      </div>
    )
  }
}