# Clippy
The Smart PDF Reader for Better Paper Reading Experience and Knowledge Mining
By: Priscilla Deng, Marie Joy Cuevas, Hannah Ruiz, and Bethany Chu

Submission for [ICSE 2023 SCORE contest](https://conf.researchr.org/track/icse-2023/icse-2023-score-2023).

## How To Run Clippy:

In the project directory, run the following command:

### `npm run-script run`

This starts the app in the development mode with both the React.js frontend and Node.js backend.

The frontend runs on [http://localhost:3000](http://localhost:3000) and the backend runs on [http://localhost:3001](http://localhost:3001).

------
![image](https://user-images.githubusercontent.com/61913136/222653449-83195a1f-0bbf-493a-881b-4c00bba146b5.png#center)
*<p align="center" class="italic">Fig 1. Preview of Clippy and the generated summary</p>*

## Code Structure
All code must go in src in order for the React app to run. For styling, minimize use of inline css styling and use the React Bootstrap for buttons.

### pdfLibrary
```
Please note the PDFs placed in this directory make use of Clippy's full functionality 
(summary, knowledge graph, cross-reference hovering).
```
Other PDFs can be loaded and viewed but not all features will be supported.

### api
All backend api calls go here. Axios is used to call the api calls.

### components
Each feature (ie. citation map, hover, etc) and its corresponding helper files go in here.

### App.js
Only add srs components here, do not overcrowd this file

------

### References
This repository uses the work from the following sources.

#### Cermine
Dominika Tkaczyk, Pawel Szostek, Mateusz Fedoryszak, Piotr Jan Dendek and Lukasz Bolikowski. 
CERMINE: automatic extraction of structured metadata from scientific literature. 
In International Journal on Document Analysis and Recognition (IJDAR), 2015, 
vol. 18, no. 4, pp. 317-335, doi: 10.1007/s10032-015-0249-8.

#### MeaningCloud Summary API
[MeaningCloud™](http://www.meaningcloud.com/) has been used for Text Analytics purposes in the development/testing/validation of this research/prototype/software.

#### SemanticScholar
[Semantic Scholar](https://www.semanticscholar.org/product/api) provides free, AI-driven search and discovery tools, and open resources for the global research community. 

#### CrossReference API
[CrossRef REST API](https://api.crossref.org/swagger-ui/index.html) has been used for research paper meta data collection.
