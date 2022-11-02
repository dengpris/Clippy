//Had to download xhr2, node.js

//Unpaywall can do query searches based on a quote
var XMLHttpRequest = require('xhr2');

//Crossreg URL:
//https://api.crossref.org/works/<DOI>
//UnPayWall URL:
//https://api.unpaywall.org/v2/<DOI>?email=cuevas.mariejoy@gmail.com

// loadJSON method to open the JSON file.
function loadJSON(path, success, error) {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          success(JSON.parse(xhr.responseText));
        }
        else {
          error(xhr);
        }
      }
    };
    xhr.open('GET', path, true);
    xhr.send();
  }
  //var url = "https://jsonplaceholder.typicode.com/posts";
  var url = "https://api.unpaywall.org/v2/10.1038/nature12373?email=cuevas.mariejoy@gmail.com"
  loadJSON(url, myData,'jsonp');
  
  function myData(Data)
  {
    // Output only the details on the first post
    console.log(Data);
  
    /* // output the details of first three posts
    console.log("First three posts");
    for(var i=0; i<3; i=i+1)
    {
      console.log(Data[i]);
    } 
    // output the id field of first five elements. 
    console.log("First five ID");
    for(var i=0; i<5; i=i+1)
    {
      console.log(Data[i].id);
    } */
  }