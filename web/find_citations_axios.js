const axios = require('axios');

axios.get('https://api.unpaywall.org/v2/10.1038/nature12373?email=cuevas.mariejoy@gmail.com').then(resp => {

    console.log(resp.data);
});

/* axios.get("https://api.unpaywall.org/v2/10.1038/nature12373?email=cuevas.mariejoy@gmail.com")
  .then((response) => {
    console.log(response.data);
  }); */