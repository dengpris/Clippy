const fs = require('fs');
const fsPromises = require('fs/promises');
const http = require('http');
const { Dict } = require('pdfjs-dist/build/pdf.worker');


const hostname = '127.0.0.1';
const port = 3001;

// Upload user chosen file remotely to server
function uploadToFile(req, filePath) {
  return new Promise(async (resolve) => {
    const uploadFile = await fs.createWriteStream(filePath);
    req.pipe(uploadFile);

    req.on('end', () => {
      uploadFile.close(() => {
        resolve();
      });
    });
  });
}

const server = http.createServer(async (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const folder = await fsPromises.mkdtemp('upload-');
  
  // Start timer
  const time_start = Date.now();
  console.log('Begin uploading PDF at time: ' + time_start);

  await uploadToFile(req, `${folder}/paper.pdf`);
  console.log('finished upload');

  const exec = require('child_process').exec;
  console.log('processing with CERMINE')
  const childProcess = exec(`java -cp CERMINE.jar pl.edu.icm.cermine.ContentExtractor -path ${folder}/ -outputs zones`, async (err, stdout, stderr) => {
    if (err) {
        console.log(err)
    }
    console.log(stdout)
  
    var files = await fsPromises.readdir(folder);
    for (i in files){
      if(files[i].includes("cermzones")){
        var user_file = files[i];
        break;
      }
    }
    const readline = require('readline');
    var file = folder.concat('/' + user_file);

    var text_dict = [];
    var title_array = [];
    var author_dict = [];
    var lastHeading = "";

    var r = readline.createInterface({
      input: fs.createReadStream(file)
    });
    r.on('line', function(text){

    if(text.match(/<zone label="*(.*)<\/zone>/)){
      test = text.match(/<zone label="*(.*)<\/zone>/);
      //console.log(test);
      input_text = test[1].match(/(.*)">(.*)/)
      heading_text = input_text[1].trim();
      lastHeading = heading_text;
      if(heading_text == "BODY_CONTENT"){
        text_dict.push(input_text[2].trim());
      }
      if(heading_text == "MET_TITLE"){
        //console.log("we found the title");
        title_array.push(input_text[2].trim());
      }
      if(heading_text == "MET_AUTHOR"){
        //console.log("we found the author");
        author_dict.push(input_text[2].trim());
        //console.log(author_dict);
      }
    }
    else if(text.match(/<zone label="*(.*)/)){
      test = text.match(/<zone label="*(.*)/);
      input_text = test[1].match(/(.*)">(.*)/)
      heading_text = input_text[1].trim();
      lastHeading = heading_text;
      if(heading_text == "BODY_CONTENT"){
        text_dict.push(input_text[2].trim());
      }
      if(heading_text == "MET_TITLE"){
        title_array.push(input_text[2].trim());
      }
      if(heading_text == "MET_AUTHOR"){
        author_dict.push(input_text[2].trim());
      }
    }
    else if ((text.match(/<document>/)) || (text.match(/<\/document>/))){
    }
    else{
      input_text = " ".concat(text);
      if (input_text.match(/(.*)<\/zone>/)){
        test = text.match(/(.*)<\/zone>/);
        input_text = test[1].trim();
      }
      if(lastHeading == "BODY_CONTENT"){
        last_body_content = text_dict[text_dict.length-1];
        last_body_content = last_body_content.concat(" ");
        text_dict[text_dict.length-1] = last_body_content.concat(input_text);
      }
      if(lastHeading == "MET_TITLE"){
        last_title_content = title_array[title_array.length-1];
        last_title_content = last_title_content.concat(" ");
        title_array[title_array.length-1] = last_title_content.concat(input_text);
      }
      if(lastHeading == "MET_AUTHOR"){
        last_author_content = author_dict[author_dict.length-1];
        last_author_content = last_author_content.concat(" ");
        author_dict[author_dict.length-1] = last_author_content.concat(input_text);
      }
    }
    });

    // Send metadata to client
    r.on('close', () => {
      pdf_info = {};
      pdf_info["TITLE"] = title_array[0];
      pdf_info["BODY_CONTENT"] = text_dict.join("");
      pdf_info["AUTHOR"] = author_dict.join("");
      //console.log(pdf_info["AUTHOR"]);
      res.write(JSON.stringify(pdf_info), () => {
        res.end();
        // Delete temp file from server
        fs.rm(folder, { recursive: true }, () => {});
      });
    });
    const time_end = Date.now();
    console.log('Process finished at time: ' + time_end);
    const time_diff = (time_end-time_start)/1000;
    console.log('Total time to process upload+CERMINE+summary: ' + time_diff + 's');
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});