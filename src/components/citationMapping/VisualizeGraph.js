import React, { useEffect, useState } from "react";
import Graph from "react-graph-vis";
import { findCitations } from "../../api/find_citations";
import { v4 as uuidv4 } from "uuid";

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import './citationMappingStyle.css'

// import "./styles.css";
// // need to import the vis network css in order to show tooltip
// import "./network.css";

const VisualizeGraph = () => {

  const [citationInfo, setCitationInfo] = useState(null);
  const [nodes, setNodes] = useState({});
  const [edges, setEdges] = useState({});
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    findCitations('Nanometre-scale+thermometry+in+a+living+cell')
    .then((res) => {
      setCitationInfo(res)
    });
  }, []);

  const getNodes = () => { // creates the node in the graph
    if(citationInfo == null) {
      return;
    }
    let graphNodes = [];
    for(let i = 0; i < Object.keys(citationInfo).length; i++) {
      console.log(Object.values(citationInfo)[i]);
      var tmpNode = {};
      tmpNode.id = Object.keys(citationInfo)[i];
      tmpNode.label = Object.values(citationInfo)[i].doi;
      tmpNode.title = Object.values(citationInfo)[i].title[0];
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
    // nodes: [
    //   { id: 1, label: "Node 1", title: "node 1 tootip text" },
    //   { id: 2, label: "Node 2", title: "node 2 tootip text" },
    //   { id: 3, label: "Node 3", title: "node 3 tootip text" },
    //   { id: 4, label: "Node 4", title: "node 4 tootip text" },
    //   { id: 5, label: "Node 5", title: "node 5 tootip text" }
    // ],
    // edges: [
    //   { from: 1, to: 2, title: 'hello' },
    //   { from: 1, to: 3 },
    //   { from: 2, to: 4 },
    //   { from: 2, to: 5 }
    // ]
    edges: edges
  };

  const options = {
    interaction: {
      dragNodes:true,
      dragView: true,
    },
    layout: {
      hierarchical: true
    },
    edges: {
      color: "#808080"
    },
    nodes: {

    },
    height: "100%",
    width: '100%'
  };

  const events = {
    select: function(event) {
      var { nodes, edges } = event;
    }
  };

  const renderModal = () => {
    return (
      <>
        <Button 
          onClick={() => {
            findCitations('Nanometre-scale+thermometry+in+a+living+cell')
            .then((res) => {
              setCitationInfo(res)
              getNodes();
              getEdges();
            });
            setShowModal(true);
          }}
          variant='secondary'
          className="mb-5"
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
              <Graph
                key={ uuidv4() } // need to generate unique key for graph each render
                graph={graph}
                options={options}
                events={events}
                // getNetwork={network => {
                //   //  if you want access to vis.js network api you can set the state in a parent component using this property
                // }}
              />
            </div>
            

          </Modal.Body>
        </Modal>
      </>
    )
  }

  return (
    <>
      {/* <Graph
        key={ uuidv4() } // need to generate unique key for graph each render
        graph={graph}
        options={options}
        events={events}
        // getNetwork={network => {
        //   //  if you want access to vis.js network api you can set the state in a parent component using this property
        // }}
      /> */}
      { renderModal() }      
    </>
    
  );

}
export default VisualizeGraph;