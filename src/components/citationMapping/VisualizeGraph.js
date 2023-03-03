import React, { useEffect, useState } from "react";
import Graph from "react-graph-vis";
import { v4 as uuidv4 } from "uuid";
import PropTypes from 'prop-types';

import { findCitations_withTitle } from "../../api/find_citations";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import './citationMappingStyle.css'

// import "./styles.css";
// // need to import the vis network css in order to show tooltip
// import "./network.css";

//WORKING WITH THE PDF FOR DEMO
const title = 'The value of standing forests for birds and people in a biodiversity hotspot'
const titlePlus = 'The+value+of+standing+forests+for+birds+and+people+in+a+biodiversity+hotspot';
const doi = '10.1371/journal.pclm.0000093';

const VisualizeGraph = () => {

  const [citationInfo, setCitationInfo] = useState(null);
  const [abstractFosInfo, setAbstractFosInfo] = useState(null);
  const [nodes, setNodes] = useState({});
  const [edges, setEdges] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [defaultDoi, setDefaultDoi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fosColours, setFosColours] = useState(null);
  const [fosToDoi, setFosToDoi] = useState(null);
  

  //MJ Idek what useEffect does but it looks like we need the find_citations in useEffect. Idek why it's getting called 3 other times tho.
  useEffect(() => {
    console.log("use effect ran");
    setDefaultDoi(doi);
    findCitations_withTitle(titlePlus)
    .then((res) => {
      setCitationInfo(res.connected_references);
      setAbstractFosInfo(res.fosAndAbstract);
      //getFosToDoi();
      //getAbstract()
    });
  }, []);

  useEffect(() => {
    if(citationInfo === null) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [citationInfo])

  const getFosToDoi = () => {

    let fosToDoi_setup = {};

    for(let i = 0; i < Object.keys(citationInfo).length; i++) {
      if(abstractFosInfo[Object.keys(citationInfo)[i]] != null && abstractFosInfo[Object.keys(citationInfo)[i]].fos != null) {

        for(let j = 0 ; j< abstractFosInfo[Object.keys(citationInfo)[i]].fos.length ; j++){
          var currField = abstractFosInfo[Object.keys(citationInfo)[i]].fos[j]
          if (!Object.keys(fosToDoi_setup).includes(currField)){
            
            fosToDoi_setup[currField] = [];
          }
          if (!fosToDoi_setup[currField].includes(Object.keys(citationInfo)[i])){
          //console.log("field: ", currField, " id: ", Object.keys(citationInfo)[i]);
            fosToDoi_setup[currField].push(Object.keys(citationInfo)[i]);
          }
      }
      }
    }
    setFosToDoi(fosToDoi_setup);
  }

  const getFOS = () => {
    if(citationInfo == null) {
      return;
    }
    let fosColours_setup = {
      ComputerScience : "#800000",
      Medicine : "#9a6324",
      Chemistry : "#808000",
      Biology : "#469990",
      MaterialsScience : "#000076",
      Physics : "#e6194b",
      Geology : "#ff7f00",
      Psychology : "#f58231",
      Art :"#ffe119",
      History : "#bfef45",
      Geography : "#3cb44b",
      Sociology : "#6b238f",
      Business : "#42d4f4",
      PoliticalScience : "#6aff00",
      Economics : "#4363d8",
      Philosophy : "#911eb4",
      Mathematics : "#f032e6",
      Engineering : "#a9a9a9",
      EnvironmentalScience : "bfff00",
      AgriculturalandFoodSciences : "#fabed4",
      Education : "#ffd8b1",
      Law : "fffac8",
      Linguistics : "#aaffc3"
    };

    setFosColours(fosColours_setup);
    //console.log(fosColours_setup);
  }

  const getNodes = () => { // creates the node in the graph
    if(citationInfo == null) {
      return;
    }
    let graphNodes = [];
    var defaultNode = {
      id: defaultDoi,
      title: defaultDoi,
      label: title
    };
    graphNodes.push(defaultNode);
    for(let i = 0; i < Object.keys(citationInfo).length; i++) {
      var tmpNode = {};
      tmpNode.id = Object.keys(citationInfo)[i];
      tmpNode.title = Object.values(citationInfo)[i].doi;
      tmpNode.label = Object.values(citationInfo)[i].title[0];
      graphNodes.push(tmpNode);
    }
    setNodes(graphNodes);
  }

  const getEdges = () => {
    if(citationInfo == null) {
      return;
    }
    
    //console.log(citationInfo["10.1002/fee.1950"]);
    //console.log(abstractFosInfo[Object.keys(citationInfo)[0]].fos[0]);
    let fosToDoi_setup = {};
    //Note that it only compares to the FIRST fosOrig. This is assuming it only has ONE fos.
    var fosOrig = "";
    if(abstractFosInfo[defaultDoi].fos != null){
      fosOrig = abstractFosInfo[defaultDoi].fos[0];
    }

    let graphEdges = [];
    for(let i = 0; i < Object.keys(citationInfo).length; i++) {
      var field="";
      if(abstractFosInfo[Object.keys(citationInfo)[i]] == null || abstractFosInfo[Object.keys(citationInfo)[i]].fos == null) {
        field = "Unknown";
      }
      else{
        // If the citation has two fos, and one of them is the fos of the original doi, then use that as the default fos instead
        // haven't checked this cuz currently no citations that satisfy this case
        
        field = abstractFosInfo[Object.keys(citationInfo)[i]].fos[0];
        for(let j = 0 ; j< abstractFosInfo[Object.keys(citationInfo)[i]].fos.length ; j++){

          var currField = abstractFosInfo[Object.keys(citationInfo)[i]].fos[j]
          if (!Object.keys(fosToDoi_setup).includes(currField)){
            
            fosToDoi_setup[currField] = [];
          }
          if (!fosToDoi_setup[currField].includes(Object.keys(citationInfo)[i])){
          //console.log("field: ", currField, " id: ", Object.keys(citationInfo)[i]);
            fosToDoi_setup[currField].push(Object.keys(citationInfo)[i]);
          }
          
          // will work even if fosOrig doesn't exist. but if it doesn't exist, then we're unecessarily going through these.
          if (fosOrig == abstractFosInfo[Object.keys(citationInfo)[i]].fos[j]){
            field = fosOrig;
            break;
          }
        }
      }


      var defaultEdge = {
        from: defaultDoi,
        to: Object.keys(citationInfo)[i],
        label: field,
        hidden: false
      };
      graphEdges.push(defaultEdge);
    

      // loop through each connected ref
      var tmpFrom = Object.keys(citationInfo)[i];
      for(let j = 0; j < Object.values(citationInfo)[i].connected_refs.length; j++) {
        field="";
        if(abstractFosInfo[Object.values(citationInfo)[i].connected_refs[j]] == null || abstractFosInfo[Object.values(citationInfo)[i].connected_refs[j]].fos == null) {
          field = "Unknown";
        }
        else {
          var fosCurr = "";
          if (abstractFosInfo[Object.keys(citationInfo)[i]].fos != null){
            fosCurr = abstractFosInfo[Object.keys(citationInfo)[i]].fos[0];
          }
  
          field = abstractFosInfo[Object.values(citationInfo)[i].connected_refs[j]].fos[0];
          for(let k = 0 ; k< abstractFosInfo[Object.values(citationInfo)[i].connected_refs[j]].fos.length ; k++){
            if (fosCurr == abstractFosInfo[Object.values(citationInfo)[i].connected_refs[j]].fos[k]){
              //console.log(Object.values(citationInfo)[i].connected_refs[j]);
              field = fosCurr;
              break;
            }
          }
        }
        var tmpEdge = {};
        //tmpEdge.id = "nextLay_"+tmpFrom;
        tmpEdge.from = tmpFrom;
        tmpEdge.to = Object.values(citationInfo)[i].connected_refs[j];
        tmpEdge.label = field;
        graphEdges.push(tmpEdge);
      }
    }
    
    console.log(fosToDoi_setup.length);
    /*
    for( let l = 0 ; l < Object.keys(fosToDoi_setup).length ; l++){
      console.log("here")
      var fos = Object.keys(fosToDoi_setup)[l];
      console.log(fos);
      for(let m = 0; m < fosToDoi_setup[fos].length -1 ; m++){
        
        var index0 = fosToDoi_setup[fos][m];
        var index1 = fosToDoi_setup[fos][m+1];
        
        var tmpEdge0 = {};
        tmpEdge0.from = index0;
        tmpEdge0.to = index1;
        tmpEdge0.label = fos;
        //tmpEdge0.color = fosColours[fos.replace(/\s/g, '')];  
        graphEdges.push(tmpEdge0);

        var tmpEdge1 = {};
        tmpEdge1.from = index1;
        tmpEdge1.to = index0;
        tmpEdge1.label = fos;
        //tmpEdge1.color = fosColours[fos.replace(/\s/g, '')];  
        graphEdges.push(tmpEdge1);

        console.log(tmpEdge0,tmpEdge1);

      }
    }
    */

    // Loop through all that have more than one fOS
    setEdges(graphEdges);
  }

  const graph = {
    nodes: nodes,
    edges: edges
  };

  const options = {
    interaction: {
      dragNodes:true,
      dragView: true,
      hover: true
    },
    layout: {
      hierarchical: {
        direction: 'LR',
        sortMethod: 'directed',
        levelSeparation: 300,
      },
    },
    physics: {
      hierarchicalRepulsion: {
        nodeDistance: 140,
      },
    },
    edges: {
      color: "#808080"
    },
    nodes: {
      widthConstraint: {
        maximum: 200,
      },
      shape: 'box',
      margin: 10
    },
    height: '600',
    width: '1100',
    
  };

  const events = {
    select: function(event) {
      var { nodes, edges } = event;
      console.log(event);
      //toggleEdgeView(event,edges);
      
    }
  };

  function toggleEdgeView (event, selected_edges) {
    console.log("nodes updating");
    var currEdges = graph.edges;
    var newEdges = selected_edges;
    console.log(currEdges);

    for (var i = 0; i < currEdges.length; i++) {
      for (var j = 0; j < newEdges.length; j++) {
        if (currEdges[i].id == newEdges[j]) {
          console.log(currEdges[i].hidden);
          console.log(currEdges[i].id);
          if (currEdges[i].hidden == true){
            currEdges[i].hidden = false;
          }else{
            currEdges[i].hidden = true;
          }
          currEdges[i].color = "#5151fc";
          //delete currEdges[i];
          
        }
      }
    }
    setEdges(currEdges);
    console.log(graph.edges);
    console.log("nodes updates");
  }

  const renderConditionalGraph = () => {
    if(!loading) {
      return (
        <Graph
          //getNetwork={network => this.setState({ network })}
          key={ uuidv4() } // need to generate unique key for graph each render
          graph={graph}
          options={options}
          events={events}
          
        />
      )
    } else {
      return (
        <p>Loading...</p>
      )
    }
  }

  const renderModal = () => {
    return (
      <>
        <Button 
          onClick={() => {
            findCitations_withTitle(titlePlus)
            .then((res) => {
              setCitationInfo(res.connected_references)
              setAbstractFosInfo(res.fosAndAbstract)
              getFosToDoi();
              getFOS();
              getNodes();
              getEdges();
            });
            setShowModal(true);
          }}
          variant='secondary'
          className="m-5"
          >
          Generate Citation Graph
        </Button>
        
        <Modal
          show={ showModal }
          onHide={ () => setShowModal(false) }
          size='xl'
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Citation Map
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Hover over nodes to see DOI!
            </p>
            <div className='vis-graph'>
              { renderConditionalGraph() }
            </div>
          </Modal.Body>
        </Modal>
      </>
    )
  }

  return (
    <>
      { renderModal() }      
    </>
    
  );

}
export default VisualizeGraph;