import React, { useEffect, useState } from "react";
import Graph from "react-graph-vis";
import { v4 as uuidv4 } from "uuid";
import PropTypes from 'prop-types';

import { findCitations_withTitle } from "../../api/find_citations";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import './citationMappingStyle.css'


//WORKING WITH THE PDF FOR DEMO
//const title = 'The value of standing forests for birds and people in a biodiversity hotspot'
//const titlePlus = 'The+value+of+standing+forests+for+birds+and+people+in+a+biodiversity+hotspot';
//const doi = '10.1371/journal.pclm.0000093';


const VisualizeGraph = ({pdfTitle}) => {

  const [citationInfo, setCitationInfo] = useState(null);
  const [abstractFosInfo, setAbstractFosInfo] = useState(null);
  const [nodes, setNodes] = useState({});
  const [edges, setEdges] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [author, setAuthor] = useState(null);
  const [fos, setFos] = useState(null);
  const [abstract, setAbstract] = useState(null);
  const [title, setTitle] = useState(null);
  const [defaultDoi, setDefaultDoi] = useState(null);
  const [loading, setLoading] = useState(true);

  const makeTitlePlus = () => {
    var title_with_pulses = pdfTitle.split(' ').join('+');
    console.log(title_with_pulses)
    return title_with_pulses;
  }
  

  //MJ Idek what useEffect does but it looks like we need the find_citations in useEffect. Idek why it's getting called 3 other times tho.
  useEffect(() => {
    
    //setDefaultDoi(doi);
    const title_with_pulses = makeTitlePlus();
    
    //setTitlePlus(title_with_pulses)
    //console.log(title_with_pulses);
    findCitations_withTitle(title_with_pulses)
    .then((res) => {
      setDefaultDoi(res.origDOI);
      setCitationInfo(res.connected_references);
      setAbstractFosInfo(res.fosAndAbstract);
      console.log('finished usedeffect findCitations');
      //console.log(citationInfo);
      //console.log(defaultDoi);
      //getFosToDoi();
      //getAbstract()
    });
    console.log("use effect ran");
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
      console.log("citation info is null so nodes is null");
      return;
    }
    let graphNodes = [];
    var defaultNode = {
      id: defaultDoi,
      title: defaultDoi,
      label: pdfTitle
    };
    console.log("defaultNode: ", defaultNode);
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
      console.log("citation info is null so edges is null");
      return;
    }
    
    //console.log(citationInfo["10.1002/fee.1950"]);
    //console.log(abstractFosInfo[Object.keys(citationInfo)[0]].fos[0]);
    let fosToDoi_setup = {};
    //Note that it only compares to the FIRST fosOrig. This is assuming it only has ONE fos.
    var fosOrig = "";
    console.log("DefaultDOI:", defaultDoi );
    if(abstractFosInfo[defaultDoi] == null){
      console.log("No abstract info for defaultDOI");
      return;
    }
    console.log(abstractFosInfo[defaultDoi]);

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
      console.log(nodes);
      //toggleEdgeView(event,edges);
      console.log(nodes[0]);
      //console.log(graph.edges);
      console.log(citationInfo[nodes[0]].author[0].given);
      var title = citationInfo[nodes[0]].title[0];
      var author = citationInfo[nodes[0]].author[0].given + citationInfo[nodes[0]].author[0].family ;
      var abstract = "";
      var fos = "";
      if (abstractFosInfo[nodes[0]] != null){
        if(abstractFosInfo[nodes[0]].abstract != null){
          abstract = abstractFosInfo[nodes[0]].abstract;
        }
        if(abstractFosInfo[nodes[0]].fos != null){
          fos = "FIELD OF STUDY:"
          if (abstractFosInfo[nodes[0]].fos.length == 1){
            fos = fos + " " + abstractFosInfo[nodes[0]].fos[0]
          }else{
            fos = fos + " " + abstractFosInfo[nodes[0]].fos[0];
            for(var i=1; i< abstractFosInfo[nodes[0]].fos.length; i++){
              fos = fos + ", " + abstractFosInfo[nodes[0]].fos[i] ;
            }
          }
          
        }
      }
      setShowNodeModal(true);
      setTitle(title);
      setAuthor(author);
      setFos(fos);
      setAbstract(abstract);
      // alert("TITLE: " + title + "\n\nAUTHOR: " + author +"\n\n" + fos + "\n\n" + abstract);
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
          
          key={ uuidv4() } // need to generate unique key for graph each render
          graph={graph}
          options={options}
          events={events}
          getNetwork={network => { 
          }}
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
            const title_with_pulses = makeTitlePlus();
            console.log(title_with_pulses);
            findCitations_withTitle(title_with_pulses)
            .then((res) => {
              setCitationInfo(res.connected_references)
              console.log(citationInfo);
              setAbstractFosInfo(res.fosAndAbstract)
              //getFosToDoi();
              //getFOS();
              getNodes();
              console.log(nodes);
              getEdges();
              console.log(edges);
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
        <Modal 
          show={ showNodeModal }
          onHide={ () => setShowNodeModal(false) }
          scrollable={true}
          style={{ maxHeight: "90vh" }}
          size='m'
          centered>
        <Modal.Header closeButton>
            <Modal.Title>
              Citation Info
            </Modal.Title>
          </Modal.Header>
          <Modal.Body
         >
            <p><b>{title}</b></p>
            <p>{author}</p>
            <p>{fos}</p>
            <p>{abstract}</p>
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