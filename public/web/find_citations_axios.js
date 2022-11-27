//const axios = require('axios');

const pdf_title = "Nanometre-scale+thermometry+in+a+living+cell";
const url_query = "https://api.crossref.org/works";
const url_title_query = url_query + "?query.title=" + pdf_title;

function compareTwoListsOfDOIReferences(origList, tempList){
    
    var similar_dois = [];
    let k = 0;
    for(let i = 0 ; i< origList.length ; i++){
        for(let j = 0; j<tempList.length; j++){
            if(origList[i] == tempList[j]){
                similar_dois[k] = tempList[j];
                k++
            }
        }
    }
    return similar_dois;
}

function getListOfConnectedRefs(pdf_refs, temp_refs,index){
    
    const currRefDOI = pdf_refs[index];
    var connected_refs = [];
    //Make sure that DOI from origList used to make tempList is listed as a similar ref
    temp_refs[temp_refs.length] = currRefDOI;
    //Compare the two lists of refs
    connected_refs = compareTwoListsOfDOIReferences(pdf_refs, temp_refs);
    return connected_refs;
}

function getDOIofReferences(pdf_data){
    
    var list_of_references = pdf_data.reference;
    let k = 0;
    
    let list_of_doi_refs = [];

    //Get referenced dois
    for( let i = 0; i<list_of_references.length; i++){
        if(list_of_references[i].DOI != undefined){
            list_of_doi_refs[k] = list_of_references[i].DOI;
            k++;
        }
    }
    return list_of_doi_refs;
}

function getRefDataByDOI(referenced_dois){

    let connected_refs = {};

    for(let i=0; i<referenced_dois.length; i++){
        const url_doi_query = url_query + "/" + referenced_dois[i];

        let ref_info = {};

        axios.get(url_doi_query)
            .then(resp => {
                //gets referenced dois of this specific doi
                temp_referenced_dois = getDOIofReferences(resp.data.message);
                //storing specific doi info
                ref_info.author = resp.data.message.author;
                ref_info.title = resp.data.message.title;
                ref_info.doi = resp.data.message.DOI;
                ref_info.references = temp_referenced_dois;

                // Takes the references of current doi and compares it with the references on the pdf
                connected_refs_for_i = getListOfConnectedRefs(referenced_dois, temp_referenced_dois,i);
                ref_info.connected_refs = connected_refs_for_i;

                //Add this doi's info on the connected_refs list
                connected_refs[referenced_dois[i]] = ref_info;

                //Just for printing
                /* if (i == referenced_dois.length-1){
                    console.log(connected_refs);
                } */
                
            })
            .catch((err)=>console.log(err)); 
    }
    return connected_refs;
}

//MAIN function starts here...
//GetRefDataByDOI is just a super big function
axios.get(url_title_query)
    .then(resp => {
        //console.log(resp.data.message.items[0]);
        //console.log(resp.data);
        referenced_dois = getDOIofReferences(resp.data.message.items[0]);
        connected_references = getRefDataByDOI(referenced_dois);
        console.log(connected_references);

})
    .catch((err)=> console.log(err));