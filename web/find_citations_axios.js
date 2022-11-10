//const axios = require('axios');

const pdf_title = "Nanometre-scale+thermometry+in+a+living+cell";
const url_query = "https://api.crossref.org/works";
const url_title_query = url_query + "?query.title=" + pdf_title;
var pdf_doi = "";
var global_pdf_references = []; //Original list of dois of references used by original pdf
var global_temp_list_references = []; //Temp list of dois of references of references
var global_list_of_connected_references = []; //Final connected references

var global_test = "fail";

function compareTwoListsOfDOIReferences(origList, tempList){
    //console.log(tempList);
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
    //console.log(similar_dois);
    return similar_dois;
}

function getListOfConnectedRefs(pdf_refs, temp_refs,index){
    //console.log(pdf_refs);
    //console.log(temp_refs);
    const currRefDOI = pdf_refs[index];
    var connected_refs = [];
    //Make sure that DOI from origList used to make tempList is listed as a similar ref
    temp_refs[temp_refs.length] = currRefDOI;
    connected_refs = compareTwoListsOfDOIReferences(pdf_refs, temp_refs);
    //console.log(connected_refs);
    return connected_refs;
}

function getDOIofReferences(pdf_data){
    //console.log("HERE");
    //window.global_test = "pass";
    var list_of_references = pdf_data.reference;
    var list_of_dois = [];
    let k = 0;
    for( let i = 0; i<list_of_references.length; i++){
        if(list_of_references[i].DOI != undefined){
            list_of_dois[k] = list_of_references[i].DOI;
            k++;
        }
    }
    return list_of_dois;
}

function getRefDataByDOI(pdf_references){
    console.log(pdf_references);
    for(let i=0; i<pdf_references.length; i++){
    //for(let i=0; i<1; i++){
        const url_doi_query = url_query + "/" + pdf_references[i];
        //console.log(i);
        if(pdf_references[i] == undefined){
            console.log("found undefined");
            console.log(i);
        }
        //console.log(pdf_references[i]);
        //console.log(url_doi_query);
        axios.get(url_doi_query)
            .then(resp => {
                //console.log(resp.data);
                window.global_temp_list_references = getDOIofReferences(resp.data.message);
                //console.log(window.global_test);
                window.global_list_of_connected_references[i] = getListOfConnectedRefs(pdf_references, window.global_temp_list_references,i);
                if(i == pdf_references.length-1){
                    // THIS IS THE FINAL LIST OF CONNECTED REFERENCES. IDEK HOW TO PLACE IT AS A GLOBAL VARIABLE
                    console.log(window.global_list_of_connected_references);
                }
            })
            .catch((err)=>console.log(err)); //THERE's an error here but i don't know why
        //console.log(window.global_list_of_connected_references);
       /*  console.log(pdf_references);
        console.log(window.global_temp_list_references);
        const currRefDOI = pdf_references[i];
        //Make sure that DOI from origList used to make tempList is listed as a similar ref
        window.global_temp_list_references[window.global_temp_list_references.length] = currRefDOI;
        window.global_list_of_connected_references[currRefDOI] = compareTwoListsOfDOIReferences(pdf_references, window.global_temp_list_references);
        console.log(window.global_list_of_connected_references[currRefDOI]); */
    }
}

//MAIN function starts here...

axios.get(url_title_query)
    .then(resp => {
        //console.log(resp.data.message.items[0]);
        window.global_pdf_references = getDOIofReferences(resp.data.message.items[0]);
        getRefDataByDOI(window.global_pdf_references);
        /* // console.log(resp.data.message.items[0].DOI);
        const pdf_doi = resp.data.message.items[0].DOI;
        console.log(resp);
        return pdf_doi; */
})
    .catch((err)=> console.log(err));
console.log("I'm Here");
//console.log(window.global_pdf_references);
//console.log(window.global_list_of_connected_references);




//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function getDOI_ofFirstReference(data) {
    var ref_arr_1 = [];
    var ref_arr_2 = [];
    ref_arr_1 = data.message.items[0].reference;
    window.global_array = data.message.items[0].reference;
    const DOI = data.message.items[0].reference[0].DOI;
    const url_doi_query = "https://api.crossref.org/works/" + DOI;
    axios.get(url_doi_query)
        .then(resp => {
            //console.log(resp.data);
            ref_arr_2 = resp.data.message.reference;
            compare_two_lists_of_references(ref_arr_1,ref_arr_2);
        })
        .catch((err) => console.log(err));
    printGlobalArray(data);
    document.getElementById('doi').textContent = DOI;
}

function printGlobalArray(data){
    console.log(window.global_array);
    console.log(data);
}

function compare_two_lists_of_references(list1,list2){

    var list1_DOI = [];
    var list2_DOI = [];
    var similar_ref = [];
    let k = 0;
    for(let i = 0; i< list1.length; i++){
        list1_DOI[i] = list1[i].DOI;
    }
    for(let i = 0; i< list2.length; i++){
        list2_DOI[i] = list2[i].DOI;
    }
    list2_DOI[list2.length] = list1_DOI[0];
    console.log(list2_DOI.length);
    if(list2_DOI[list2.length] == list1_DOI[0]){
        console.log("I am here");
    }
    console.log(list2_DOI.length);
    for(let i = 0; i< list1_DOI.length; i++){
        for(let j = 0; j< list2_DOI.length; j++){
            //console.log(list2_DOI[j]);
            //console.log(list1_DOI[i]);
            if(list2_DOI[j] == list1_DOI[i]){
                console.log(list2_DOI[j]);
                similar_ref[k] = list2_DOI[j];
                k++;
            }
        }
    }
    console.log(list1_DOI);
    console.log(list2_DOI);
    console.log(similar_ref);
}

function temp_referencesOfDoi(doi){
    const url_doi_query = "https://api.crossref.org/works" + doi;
}

function getDOI(data) {
    console.log(data);
    pdf_doi = data.message.items[0].DOI;
    //console.log(pdf_doi);
    document.getElementById('doi').textContent = pdf_doi;
}


//store all the references with their DOIs,
//one DOI reference and find their reference
//compare reference with the original reference and find any similarities
//repeat for each DOI

//console.log("hello world");
//console.log(pdf_doi);
