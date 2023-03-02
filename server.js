const http = require('http');
const { Dict } = require('pdfjs-dist/build/pdf.worker');

const hostname = '127.0.0.1';
const port = 3001;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');

  const exec = require('child_process').exec;
  const childProcess = exec('java -cp CERMINE.jar pl.edu.icm.cermine.ContentExtractor -path src/pdfLibrary/TestPDF -outputs zones', function(err, stdout, stderr) {
    if (err) {
        console.log(err)
    }
    console.log(stdout)
  })
  
  const fs = require('fs');
  var dir_path = 'src/pdfLibrary/TestPDF'
  var files = fs.readdirSync(dir_path);
  for (i in files){
    if(files[i].includes("cermzones")){
      var user_file = files[i];
      break;
    }
  }
  console.log(user_file);
  const readline = require('readline');
  var file = dir_path.concat(user_file);
  console.log(file);

  var text_dict = {};
  var lastHeading = "";

  var r = readline.createInterface({
    input: fs.createReadStream(file)
  });
  r.on('line', function(text){
   console.log("Line: ", text);
   
   if(text.match(/<zone label="*(.*)<\/zone>/)){
    console.log("Line 2: ", text);
    test = text.match(/<zone label="*(.*)<\/zone>/);
    console.log("Captured Title:", test[1]);
    input_text = test[1].match(/(.*)">(.*)/)
    console.log("Heading:", input_text[1].trim(), "Text:",input_text[2].trim());
    heading_text = input_text[1].trim();
    if (heading_text in text_dict){
      if(!(/\d/.test(heading_text.slice(-1)))){
        heading_text.concat("_0")
      }
      else{
        var num = heading_text.slice(-1);
        num+=1;
        heading_text.slice(0, -1);
        heading_text.concat(num);
      }
    }
    lastHeading = heading_text;
    text_dict[heading_text] = input_text[2].trim();
    console.log(JSON.stringify(text_dict));
    //zone_array.push()
   }
   else if(text.match(/<zone label="*(.*)/)){
    test = text.match(/<zone label="*(.*)/);
    console.log("Captured Title_Continue:", test[1]);
    input_text = test[1].match(/(.*)">(.*)/)
    console.log("Heading:", input_text[1].trim(), "Text:",input_text[2].trim());
    heading_text = input_text[1].trim();
    if (heading_text in text_dict){
      var last_character = heading_text.slice(-1);
      console.log("Last Char:", last_character);
      if(!(/\d/.test(heading_text.slice(-1)))){
        console.log("Hello");
        heading_text = heading_text.concat("_0")
      }
      else{
        var num = heading_text.slice(-1);
        num+=1;
        heading_text = heading_text.slice(0, -1);
        heading_text = heading_text.concat(num);
      }
    }
    lastHeading = heading_text;
    text_dict[heading_text] = input_text[2].trim();
    console.log(JSON.stringify(text_dict));
   }
   else if ((text.match(/<document>/)) || (text.match(/<\/document>/))){
    console.log("Skip!");
   }
   else{
    console.log("Captured Line_From_Continue: ", text);
    input_text = " ".concat(text);
    text_dict[lastHeading] = text_dict[lastHeading].concat(input_text);
    console.log(JSON.stringify(text_dict));
   }

  });


});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});