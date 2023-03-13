import axios from 'axios';

const url_query = "https://api.crossref.org/works";
const ss_url_query = "https://api.semanticscholar.org/graph/v1/paper/" 
const abstract_query = "?fields=abstract"

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
  var keys = {}
  for(let i = 0; i < referenced_dois.length; i++) {
    const url_doi_query = url_query + "/" + referenced_dois[i];
    let ref_info = [];
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
      //console.log(i)
      //console.log(Object.values(connected_refs))
      keys = Object.keys(connected_refs)
    })
    .catch((err)=>console.log(err)); 
  }
  //console.log(connected_refs)
  //console.log("Here")
  //console.log(Object.values(connected_refs)[0])
  //console.log(Object.getOwnPropertyNames(connected_refs))
  return connected_refs;
}

function sortData(citationData){
    
  let newFosAndAbstract = {};
  console.log(Object.keys(citationData.connected_references)[0]);
  console.log(Object.keys(citationData.fosAndAbstract)[0]);
  for( let i = 0; Object.keys(citationData.connected_references).length; i++ ){
    for( let j = 0; Object.keys(citationData.fosAndAbstract).length; j++)
      if(Object.keys(citationData.connected_references)[i] == Object.keys(citationData.fosAndAbstract)[j]){
        console.log("here");
        newFosAndAbstract[Object.keys(citationData.connected_references)[i]] = Object.values(citationData.fosAndAbstract)[j];
      }
  }
  //console.log(Object.keys(newFosAndAbstract));
}

const getFieldsOfStudy = async(ref_dois) => {
  //console.log(Object.keys(connected_refs))
  let fosAndAbstract = {};
  for(let i = 0; i < ref_dois.length; i++){
    var url_abstract_query = ss_url_query + ref_dois[i] + "?fields=fieldsOfStudy,abstract";
    let ref_info = {}
    axios.get(
      url_abstract_query
    )
    .then(res => {
      ref_info.fos = res.data.fieldsOfStudy;
      ref_info.abstract = res.data.abstract;
      //ref_info.title = res.data.title;
      fosAndAbstract[ref_dois[i]] = ref_info
    })
    .catch((err)=>console.log(err));
  }
  //console.log(fosAndAbstract[ref_dois[0]])
  return fosAndAbstract
}

// const pdf_title = "Nanometre-scale+thermometry+in+a+living+cell";
// const url_query = "https://api.crossref.org/works";
// const url_title_query = url_query + "?query.title=" + pdf_title;

export const findCitations_withTitle = async (pdfTitle) => {
  console.log(pdfTitle)
  let urlRequest = 'https://api.crossref.org/works?query.title=' + pdfTitle
  let citationData = {}
  let sortedData = {}
  //const org_doi = "10.1371/journal.pclm.0000093"
  console.log("HELLO4")
  try {
    const res = await axios.get(
      urlRequest
    );
    var referenced_dois = getDOIofReferences(res.data.message.items[0]);
    //var connected_references = await getRefDataByDOI(referenced_dois);
    citationData.connected_references = await getRefDataByDOI(referenced_dois);

    var new_referenced_dois = referenced_dois;

    const org_doi = res.data.message.items[0].DOI;
    new_referenced_dois.push(org_doi);

    citationData.fosAndAbstract = await getFieldsOfStudy(new_referenced_dois);
    console.log(citationData);
   // sortedData = sortData(citationData);
    //var abstracts_from_dois = await getAbstracts(new_referenced_dois);
    //citationData.abstracts_from_dois = await getAbstracts(new_referenced_dois);
    //console.log(citationData.abstracts_from_dois['10.1002/fee.1950'])
    //console.log(Object.values(citationData.abstracts_from_dois[0]).abstract)
    //var connected_subjects = getSimilarWords(abstracts_from_dois, org_doi);
    
    return citationData;
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

 /*
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
} */

//Search by DOI/paperID:
// https://api.semanticscholar.org/graph/v1/paper/<DOI/PaperID>?fields=abstract
//Search by Title:
// https://api.semanticscholar.org/graph/v1/paper/search?query=title:%20(The+Role+of+Sensation+Seeking+in+Political+Violence)&limit=1
//