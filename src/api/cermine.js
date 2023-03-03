const exec = require('child_process').exec;
const childProcess = exec('java -cp C:\\Users\\hccru\\Downloads\\CERMINE.jar pl.edu.icm.cermine.ContentExtractor -path C:\\Users\\hccru\\ClippyFinal\\Clippy\\src\\pdfLibrary\\ -outputs zones', function(err, stdout, stderr) {
    if (err) {
        console.log(err)
    }
    console.log(stdout)
})