import axios from 'axios';

const url_query = "https://api.crossref.org/works";

function compareTwoListsOfDOIReferences(origList, tempList){
  var similar_dois = [];
  let k = 0;
  for(let i = 0 ; i< origList.length ; i++){
      for(let j = 0; j<tempList.length; j++){
          if(origList[i] === tempList[j]){
              similar_dois[k] = tempList[j];
              k++
          }
      }
  }
  return similar_dois;
}

function getListOfConnectedRefs(pdf_refs, temp_refs,index){
  // const currRefDOI = pdf_refs[index];
  var connected_refs = [];
  //Make sure that DOI from origList used to make tempList is listed as a similar ref
  // temp_refs[temp_refs.length] = currRefDOI;
  //Compare the two lists of refs
  connected_refs = compareTwoListsOfDOIReferences(pdf_refs, temp_refs);
  return connected_refs;
}

function getDOIofReferences(pdf_data){
  var list_of_references = pdf_data.reference;
  let list_of_doi_refs = [];
  for(let i = 0; i < list_of_references.length; i++){
    if(list_of_references[i].DOI !== undefined){
      list_of_doi_refs.push(list_of_references[i].DOI);
    }
  }
  return list_of_doi_refs;
}

const getRefDataByDOI = async(referenced_dois) => {
  let connected_refs = {};
  for(let i = 0; i < referenced_dois.length; i++) {
    const url_doi_query = url_query + "/" + referenced_dois[i];
    let ref_info = {};
    axios.get(
      url_doi_query
    )
    .then(res => {
      //gets referenced dois of this specific doi
      var temp_referenced_dois = getDOIofReferences(res.data.message);
      //storing specific doi info
      ref_info.author = res.data.message.author;
      ref_info.title = res.data.message.title;
      ref_info.doi = res.data.message.DOI;
      ref_info.references = temp_referenced_dois;
      // Takes the references of current doi and compares it with the references on the pdf
      var connected_refs_for_i = getListOfConnectedRefs(referenced_dois, temp_referenced_dois,i);
      ref_info.connected_refs = connected_refs_for_i;
      //Add this doi's info on the connected_refs list
      connected_refs[referenced_dois[i]] = ref_info;  
    })
    .catch((err)=>console.log(err)); 
  }
  // await new Promise(r => setTimeout(r, 2000));
  return connected_refs;
}

// const pdf_title = "Nanometre-scale+thermometry+in+a+living+cell";
// const url_query = "https://api.crossref.org/works";
// const url_title_query = url_query + "?query.title=" + pdf_title;

export const findCitations_withTitle = async (pdfTitle) => {
  let urlRequest = 'https://api.crossref.org/works?query.title=' + pdfTitle
  try {
    const res = await axios.get(
      urlRequest
    );
    //console.log(res.data.message);
    var referenced_dois = getDOIofReferences(res.data.message.items[0]);
    //console.log(referenced_dois);
    var connected_references = await getRefDataByDOI(referenced_dois);
    return connected_references;
  } catch (err) {
    return console.log('error calling findCitations', err);
  }
}

export const findCitations_withDOI = async (PDFdoi) => {
  let urlRequest = 'https://api.crossref.org/works/' + PDFdoi
  try {
    const res = await axios.get(
      urlRequest
    );
    console.log(res.data.message);
    var referenced_dois = getDOIofReferences(res.data.message);
    console.log(referenced_dois);
    var connected_references = await getRefDataByDOI(referenced_dois);
    return connected_references;
  } catch (err) {
    return console.log('error calling findCitations', err);
  }
}

// export const findCitations = async (pdfTitle) => {
//   let urlRequest = 'https://api.crossref.org/works?query.title=' + pdfTitle
//   return axios.get(
//     urlRequest
//   )
//   .then((res) => console.log(res))
//   .catch((err) => console.log(err))
// }

/* const ss_url_query = "https://api.semanticscholar.org/graph/v1/paper/" 
const abstract_query = "?fields=abstract"

function getPaperID(pdf_data){
  var paperID = pdf_data.data[0].paperId; //check if it's the right shape EX: https://api.semanticscholar.org/graph/v1/paper/search?query=title:%20(The+Role+of+Sensation+Seeking+in+Political+Violence)
  return paperID;
}

const getAbstract = async(doi) => {
  
  var url_abstract_query = ss_url_query + doi + abstract_query;
  axios.get(
    url_doi_query
  )
  .then(res => {
    //gets abstract of specific doi
    var temp_referenced_dois = getDOIofReferences(res.data.message);
    //storing specific doi info
    ref_info.author = res.data.message.author;
    ref_info.title = res.data.message.title;
    ref_info.doi = res.data.message.DOI;
    ref_info.references = temp_referenced_dois;
    // Takes the references of current doi and compares it with the references on the pdf
    var connected_refs_for_i = getListOfConnectedRefs(referenced_dois, temp_referenced_dois,i);
    ref_info.connected_refs = connected_refs_for_i;
    //Add this doi's info on the connected_refs list
    connected_refs[referenced_dois[i]] = ref_info;  
  })
  .catch((err)=>console.log(err)); 
}


const getSubjectsByAbstract = async(referenced_dois) => {
  let connected_refs = {};
  for(let i = 0; i < referenced_dois.length; i++) {
    const url_abstract_query = ss_url_query + referenced_dois[i] + abstract_query;
    let ref_info = {};
    axios.get(
      url_abstract_query
    )
    .then(res => {
      //gets abstract of specific doi
      var temp_referenced_dois = getDOIofReferences(res.data.message);
      //storing specific doi info
      ref_info.doi = res.data.message.DOI;
      ref_info.subjects = temp_referenced_dois;
      // Takes the references of current doi and compares it with the references on the pdf
      var connected_refs_for_i = getListOfConnectedRefs(referenced_dois, temp_referenced_dois,i);
      ref_info.connected_refs = connected_refs_for_i;
      //Add this doi's info on the connected_refs list
      connected_refs[referenced_dois[i]] = ref_info;  
    })
    .catch((err)=>console.log(err)); 
  }
  // await new Promise(r => setTimeout(r, 2000));
  return connected_refs;
}

export const findSimilarSubjects = async (pdfTitle) => {
  let urlRequest = 'https://api.crossref.org/works?query.title=' + pdfTitle
  try {
    const res = await axios.get(
      urlRequest
    );
    var referenced_dois = getDOIofReferences(res.data.message.items[0]);
    //Get connections by references
    var connected_references = await getRefDataByDOI(referenced_dois);
    //Get connections by subjects
    var connected_subjects = await getSubjectsByAbstract(referenced_dois);
    return connected_references, connected_subjects;
  } catch (err) {
    return console.log('error calling findCitations', err);
  }
}

//Search by DOI/paperID:
// https://api.semanticscholar.org/graph/v1/paper/<DOI/PaperID>?fields=abstract
//Search by Title:
// https://api.semanticscholar.org/graph/v1/paper/search?query=title:%20(The+Role+of+Sensation+Seeking+in+Political+Violence)&limit=1
// */