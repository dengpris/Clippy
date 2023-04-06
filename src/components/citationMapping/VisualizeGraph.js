import React, { useEffect, useMemo, useState } from "react";
import Graph from "react-graph-vis";
import { v4 as uuidv4 } from "uuid";
import PropTypes from 'prop-types';

import { findCitations_withTitle } from "../../api/find_citations";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ProgressBar from "./progress-bar.component";
import loading_logo from '../citationMapping/book_loading.gif';
import './citationMappingStyle.css'


//WORKING WITH THE PDF FOR DEMO
//const title = 'The value of standing forests for birds and people in a biodiversity hotspot'
//const titlePlus = 'The+value+of+standing+forests+for+birds+and+people+in+a+biodiversity+hotspot';
//const doi = '10.1371/journal.pclm.0000093';


const VisualizeGraph = ({pdfTitle, pdfAuthor}) => {

  const [citationInfo, setCitationInfo] = useState(null);
  const [abstractFosInfo, setAbstractFosInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [author, setAuthor] = useState(null);
  const [fos, setFos] = useState(null);
  const [abstract, setAbstract] = useState(null);
  const [title, setTitle] = useState(null);
  const [defaultDoi, setDefaultDoi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(true);
  const [endTime, setEndTime] = useState(true);
  const [progress, setProgress] = useState(2);
  const [startProgress, setStartProgress] = useState(false);
  const [stopProgress, setStopProgress] = useState(false);
  const [progressInteval, setProgressInterval] = useState(5);

  const makeTitlePlus = () => {
    var title_with_pulses = pdfTitle.split(' ').join('+');
    //console.log(title_with_pulses)
    return title_with_pulses;
  }
  
  const makeAuthorPlus = (index) => {
    var author_with_pulses = pdfAuthor[index].split(' ').join('+');
    //console.log(title_with_pulses)
    return author_with_pulses;
  }

  const nodes = useMemo(() => { // creates the node in the graph
    if(citationInfo == null) {
      console.log("citation info is null so nodes is null");
      return [];
    }
    let graphNodes = [];
    for(let i = 0; i < Object.keys(citationInfo).length; i++) {
      //if(Object.keys(citationInfo)[i].doi != defaultDoi){
      var tmpNode = {};
      tmpNode.id = Object.keys(citationInfo)[i];
      tmpNode.title = Object.values(citationInfo)[i].doi;
      tmpNode.label = Object.values(citationInfo)[i].title[0];
      graphNodes.push(tmpNode);
      //}
    }
    console.log("graphNodes", graphNodes);
    if(graphNodes!= null){
      setStopProgress(true);
    }
    return graphNodes;
  }, [citationInfo]);

  useEffect(() => {
    if(!nodes || Object.keys(nodes).length == 0) {
      setLoading(true);
    } else {
      console.log(Date.now());
      setEndTime(Date.now())
      console.log((endTime-startTime)/1000);
      setLoading(false);
    }
  }, [nodes]);

  const edges = useMemo(() => {
    if(citationInfo == null || abstractFosInfo == null) {
      console.log("citation info is null so edges is null");
      return [];
    }
    console.log(Object.keys(citationInfo).length);
    console.log(Object.keys(abstractFosInfo).length);
    //console.log(citationInfo["10.1002/fee.1950"]);
    //console.log(abstractFosInfo[Object.keys(citationInfo)[0]].fos[0]);
    let fosToDoi_setup = {};
    //Note that it only compares to the FIRST fosOrig. This is assuming it only has ONE fos.
    var fosOrig = "";
    if(abstractFosInfo[defaultDoi] == null){
      console.log("No abstract info for defaultDOI");
      return [];
    }

    if(abstractFosInfo[defaultDoi].fos != null){
      fosOrig = abstractFosInfo[defaultDoi].fos[0];
    }

    let graphEdges = [];
    for(let i = 0; i < Object.keys(citationInfo).length; i++) {
      var field="";
      if(abstractFosInfo[Object.keys(citationInfo)[i]] == null || abstractFosInfo[Object.keys(citationInfo)[i]].fos == null) {
        field = "";
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

      if(defaultDoi != Object.keys(citationInfo)[i]){
        var defaultEdge = {
          from: defaultDoi,
          to: Object.keys(citationInfo)[i],
          label: field,
          hidden: false
        };
        graphEdges.push(defaultEdge);
      }

      // loop through each connected ref
      var tmpFrom = Object.keys(citationInfo)[i];
      if(Object.values(citationInfo)[i].connected_refs != null){
      
        for(let j = 0; j < Object.values(citationInfo)[i].connected_refs.length; j++) {
          field="";
          if(abstractFosInfo[Object.values(citationInfo)[i].connected_refs[j]] == null || abstractFosInfo[Object.values(citationInfo)[i].connected_refs[j]].fos == null) {
            field = "";
          }
          else {
            var fosCurr = "";
            if (abstractFosInfo[Object.keys(citationInfo)[i]] != null && abstractFosInfo[Object.keys(citationInfo)[i]].fos != null){
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
    }
    
    //console.log(fosToDoi_setup.length);
    console.log("graphEdges", graphEdges);
    return graphEdges;
  }, [citationInfo, abstractFosInfo]);

  const graph = {
    nodes: nodes,
    edges: edges
  };
  //console.log(graph);

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
    }

  };

  const renderConditionalGraph = () => {
    if(!loading) {
      //console.timeEnd("timer");
      //setEndTime(Date.now())
      //const timerCount = endTime -startTime;
      //console.log(timerCount);
      return (
        <>
          <p>
            Click on the nodes to see more information!
          </p>
          <Graph
            
            key={ uuidv4() } // need to generate unique key for graph each render
            graph={graph}
            options={options}
            events={events}
            getNetwork={network => { 
            }}
          />
        </>
      )
    } else {
      return (
        <>
          <span className="loading-caption">We're still generating the map...Please come back later!</span>
          <img src={loading_logo} alt="Generating map..." className="loading-img"/>
          <ProgressBar bgcolor={"#22985a"} completed={progress} centered/>
        </>
      )
    }
  }

  //I dont think this works
  function getProgressInterval(refs){
    const progress_interval = 5; //default is 20 seconds, which is 100/20 = 5
    const num_refs = Object.keys(refs).length;
    if(num_refs < 75 ){
      progress_interval = 100/20; //loading should end within 10 seconds
    }
    else if(num_refs<100){
      progress_interval = Math.round(100/25);
    }
    else{
      progress_interval = Math.round(100/30);
    }
    setProgressInterval(progress_interval);
  }

  let timer = React.useRef(undefined);

  useEffect(() => {
    
    if (!timer.current && startProgress) {
      console.log("progress bar has started");
      timer.current = setInterval(() => {
        setProgress((prev) => {
          if(stopProgress){
            prev = 98
            return prev;
          }
          if (prev < 90) {
            return prev + progressInteval; //5 because I want it to finish in 20 seconds // + 100*(NUmber of seconds we think it will take)
          }
          if(prev>90 && prev < 100){
            prev =99;
            return 99; //will make it stop at 99% if it's still loading
          }
          if (prev === 100) {
            clearInterval(timer.current);
          }
          return prev; // divided by 2 because the bar only takes up 50% of the modal
        });
      }, 1000);
    }
  }, [startTime]);

  const renderModal = () => {
    return (
      <>
        <Button 
          onClick={() => {
            console.log(Date.now());
            setStartTime(Date.now());
            setStartProgress(true);
            const title_with_pulses = makeTitlePlus();
            const author_with_pulses = makeAuthorPlus(0);
            console.log(title_with_pulses);
            findCitations_withTitle(title_with_pulses, author_with_pulses)
            .then((res) => {
              setDefaultDoi(res.origDOI);
              setCitationInfo(res.connected_references);
              setAbstractFosInfo(res.fosAndAbstract);
              getProgressInterval(res.connected_references);
              //getFosToDoi();
              //getFOS();
            });
            //const DoneApiTime = Date.now();
            //console.log(startTime-DoneApiTime/1000);
            setShowModal(true);
          }}
          variant='secondary'
          className="m-5"
          >
          Generate Knowledge Graph
        </Button>
        
        <Modal
          className="my-modal"
          show={ showModal }
          onHide={ () => setShowModal(false) }
          size='xl'
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Knowledge Graph
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
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