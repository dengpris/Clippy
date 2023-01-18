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
  const [nodes, setNodes] = useState({});
  const [edges, setEdges] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [defaultDoi, setDefaultDoi] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDefaultDoi(doi);
    findCitations_withTitle(titlePlus)
    .then((res) => {
      setCitationInfo(res)
    });
  }, []);

  useEffect(() => {
    if(citationInfo === null) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [citationInfo])

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
    let graphEdges = [];
    for(let i = 0; i < Object.keys(citationInfo).length; i++) {
      var defaultEdge = {
        from: defaultDoi,
        to: Object.keys(citationInfo)[i]
      };
      graphEdges.push(defaultEdge);
      var tmpFrom = Object.keys(citationInfo)[i];
      // loop through each connected ref
      for(let j = 0; j < Object.values(citationInfo)[i].connected_refs.length; j++) {
        var tmpEdge = {};
        tmpEdge.from = tmpFrom;
        tmpEdge.to = Object.values(citationInfo)[i].connected_refs[j];
        graphEdges.push(tmpEdge);
      }      
    }
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
              setCitationInfo(res)
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