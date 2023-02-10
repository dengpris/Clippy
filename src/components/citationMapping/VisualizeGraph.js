import React, { useEffect, useState } from "react";
import Graph from "react-graph-vis";
import { findCitations_withTitle } from "../../api/find_citations";
import { v4 as uuidv4 } from "uuid";

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

//const title = 'Nanometre-scale thermometry in a living cell'
//const titlePlus = 'Nanometre-scale+thermometry+in+a+living+cell'
//const doi = '10.1038/nature12373'

const VisualizeGraph = () => {

  const [citationInfo, setCitationInfo] = useState(null);
  const [abstractFosInfo, setAbstractFosInfo] = useState(null);
  const [nodes, setNodes] = useState({});
  const [edges, setEdges] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [defaultDoi, setDefaultDoi] = useState(null);
  const [loading, setLoading] = useState(true);


  //MJ Idek what useEffect does but it looks like we need the find_citations in useEffect. Idek why it's getting called 3 other times tho.
  useEffect(() => {
    console.log("use effect ran");
    setDefaultDoi(doi);
    findCitations_withTitle(titlePlus)
    //findCitations_withDOI(doi)
    .then((res) => {
      setCitationInfo(res.connected_references)
      setAbstractFosInfo(res.fosAndAbstract)
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

  const getFOS = () => {
/*     let newAbsFosInfo = {};
    newAbsFosInfo[Object.keys(citationInfo)[0]] = Object.values(abstractFosInfo)[0];
    console.log(newAbsFosInfo); */
    console.log("hi");
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
    
    console.log(citationInfo["10.1002/fee.1950"]);
    console.log(abstractFosInfo[Object.keys(citationInfo)[0]].fos[0]);
    
    var fosOrig = "";
    if(abstractFosInfo[defaultDoi].fos != null){
      fosOrig = abstractFosInfo[defaultDoi].fos;
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
        label: field
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
          field = abstractFosInfo[Object.values(citationInfo)[i].connected_refs[j]].fos[0];
        }
        var tmpEdge = {};
        tmpEdge.from = tmpFrom;
        tmpEdge.to = Object.values(citationInfo)[i].connected_refs[j];
        tmpEdge.label = field;
        graphEdges.push(tmpEdge);
      }
    }
    

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
    width: '700',
    
  };

  const events = {
    select: function(event) {
      var { nodes, edges } = event;
    }
  };

  const renderConditionalGraph = () => {
    if(!loading) {
      return (
        <Graph
          key={ uuidv4() } // need to generate unique key for graph each render
          graph={graph}
          options={options}
          events={events}
          // getNetwork={network => {
          //   //  if you want access to vis.js network api you can set the state in a parent component using this property
          // }}
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