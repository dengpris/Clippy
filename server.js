const fs = require('fs');
const fsPromises = require('fs/promises');
const http = require('http');
const { Dict } = require('pdfjs-dist/build/pdf.worker');


const hostname = '127.0.0.1';
const port = 3001;

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
    //console.log(user_file);
    const readline = require('readline');
    var file = folder.concat('/' + user_file);
    //console.log(file);

    var text_dict = [];
    var title_array = [];
    var lastHeading = "";

    var r = readline.createInterface({
      input: fs.createReadStream(file)
    });
    r.on('line', function(text){
    //console.log("Line: ", text);

    if(text.match(/<zone label="*(.*)<\/zone>/)){
      //console.log("Line 2: ", text);
      test = text.match(/<zone label="*(.*)<\/zone>/);
      //console.log("Captured Title:", test[1]);
      input_text = test[1].match(/(.*)">(.*)/)
      //console.log("Heading:", input_text[1].trim(), "Text:",input_text[2].trim());
      heading_text = input_text[1].trim();
      lastHeading = heading_text;
      if(heading_text == "BODY_CONTENT"){
        text_dict.push(input_text[2].trim());
        //console.log(JSON.stringify(text_dict));
      }
      if(heading_text == "MET_TITLE"){
        title_array.push(input_text[2].trim());
        //console.log(JSON.stringify(title_array));
      }
      //zone_array.push()
    }
    else if(text.match(/<zone label="*(.*)/)){
      test = text.match(/<zone label="*(.*)/);
      //console.log("Captured Title_Continue:", test[1]);
      input_text = test[1].match(/(.*)">(.*)/)
      //console.log("Heading:", input_text[1].trim(), "Text:",input_text[2].trim());
      heading_text = input_text[1].trim();
      lastHeading = heading_text;
      if(heading_text == "BODY_CONTENT"){
        text_dict.push(input_text[2].trim());
        //console.log(JSON.stringify(text_dict));
      }
      if(heading_text == "MET_TITLE"){
        title_array.push(input_text[2].trim());
        //console.log(JSON.stringify(title_array));
      }
    }
    else if ((text.match(/<document>/)) || (text.match(/<\/document>/))){
      //console.log("Skip!");
    }
    else{
      //console.log("Captured Line_From_Continue: ", text);
      input_text = " ".concat(text);
      if (input_text.match(/(.*)<\/zone>/)){
        test = text.match(/(.*)<\/zone>/);
        input_text = test[1].trim();
      }
      if(lastHeading == "BODY_CONTENT"){
        last_body_content = text_dict[text_dict.length-1];
        last_body_content = last_body_content.concat(" ");
        text_dict[text_dict.length-1] = last_body_content.concat(input_text);
        //console.log(JSON.stringify(text_dict));
      }
      if(lastHeading == "MET_TITLE"){
        last_title_content = title_array[title_array.length-1];
        last_title_content = last_title_content.concat(" ");
        title_array[title_array.length-1] = last_title_content.concat(input_text);
        //console.log(JSON.stringify(title_array));
      }
    }
    // console.log(JSON.stringify(text_dict));
    // console.log(JSON.stringify(title_array));
    });

    r.on('close', () => {
      pdf_info = {};
      pdf_info["TITLE"] = title_array[0];
      pdf_info["BODY_CONTENT"] = text_dict.join("");
      res.write(JSON.stringify(pdf_info), () => {
        res.end();

        fs.rm(folder, { recursive: true }, () => {});
      });
    });
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});