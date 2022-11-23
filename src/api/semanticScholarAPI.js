import axios from 'axios';

export const searchByKeyWord = () => {
  return axios.get(
    // 'https://api.semanticscholar.org/graph/v1/paper/search?query=covid+vaccination&offset=100&limit=3',
    'https://api.semanticscholar.org/graph/v1/paper/search?query=literature+graph&offset=10&limit=50&fields=title,authors',
  )
  .then((res) => {
    console.log(res.data.data);
    return res.data.data;
  })
  .catch((err) => {
    console.log(err)
    return;
  })
}