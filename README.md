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

