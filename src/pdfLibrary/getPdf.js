// this file is needed because imports are static
/**
  @todo: convert to async dynamic imports
  @todo: find out where else pdfs are hard coded
**/

import DOI_article_ELIS3 from './DOI_article_ELIS3.pdf';
import Draft_Proposal from './Draft_Proposal.pdf';
import Henlosample from './Henlosample.pdf';
import nature12373 from './nature12373.pdf';
import PDF_Test_TLDR from './PDF_Test_TLDR.pdf';
import sample from './sample.pdf';
import Test1 from './Test1.pdf';
import Test3 from './Test3.pdf';


export const getPdf = (url) => {
  switch(url) {
    case 'DOI_article_ELIS3.pdf':
      return DOI_article_ELIS3;
    case 'Draft_Proposal.pdf':
      return Draft_Proposal;
    case 'Henlosample.pdf':
      return Henlosample;
    case 'nature12373.pdf':
      return nature12373;
    case 'PDF_Test_TLDR.pdf':
      return PDF_Test_TLDR;  
    case 'sample.pdf':
      return sample; 
    case 'Test1.pdf':
      return Test1; 
    case 'Test3.pdf':
      return Test3;
    default:
      return DOI_article_ELIS3;
  }
}