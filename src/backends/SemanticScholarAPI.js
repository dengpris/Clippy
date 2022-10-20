import React from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';

const SemanticScholarAPI = () => {
  const searchAPI = () => {
    axios.get(
      'http://api.semanticscholar.org/graph/v1/paper/search?query=literature+graph' // replace this
    )
    .then((res) => {
      console.log(res)
    })
    .catch((err) => {
      console.log('Theres an error: ', err)
    })
  }
  return (
    <div>
      <Button
        onClick={() => searchAPI()}
      >
        Search API
      </Button>
    </div>
    
  )
}
export default SemanticScholarAPI;