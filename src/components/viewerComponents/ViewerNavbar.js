
import './viewerComponents.css';

import React from 'react';
import PropTypes from 'prop-types';

import { BsArrowRight, BsArrowLeft, BsArrowBarRight, BsArrowBarLeft } from 'react-icons/bs';
import { AiOutlineZoomIn, AiOutlineZoomOut } from 'react-icons/ai';
import { Button, Nav, Navbar } from 'react-bootstrap';

const ViewerNavbar = (props) => {
  const {
    onSummaryClick,
    currentPage,
    totalPageCount,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    onZoomIn,
    onZoomOut,
    zoomScale,
    onCrossRefClick,
  } = props;



  const renderPageCounts = () => (
    <div>
      <Button 
        variant='outline-secondary'
        size='sm'
        className='rounded-circle mx-3'
        onClick={ () => firstPage() }
        disabled={ currentPage === 1 ? true : false }
      >
        <BsArrowBarLeft/>
      </Button> 
      <Button 
        variant='outline-secondary'
        size='sm'
        className='rounded-circle'
        onClick={ () => previousPage() }
        disabled={ currentPage === 1 ? true : false }
      >
        <BsArrowLeft/>
      </Button>
      <Navbar.Text className='px-3'> Page { currentPage } of { totalPageCount } </Navbar.Text>
      <Button 
        variant='outline-secondary'
        size='sm'
        className='rounded-circle'
        onClick={ () => nextPage() }
        disabled={ currentPage === totalPageCount ? true : false }
      >
        <BsArrowRight/>
      </Button>
      <Button 
        variant='outline-secondary'
        size='sm'
        className='rounded-circle mx-3'
        onClick={ () => lastPage() }
        disabled={ currentPage === totalPageCount ? true : false }
      >
        <BsArrowBarRight/>
      </Button>
    </div>
  )

  const renderZoomButtons = () => (
    <div>
      <Button
        className='rounded-circle mx-3'
        variant='outline-secondary'
        size='sm'
        onClick={ () => onZoomOut() }
        disabled={ zoomScale <= 0.7 ? true : false }
      >
      <AiOutlineZoomOut/>
      </Button>
      
      <Navbar.Text className='px-3'>{ Math.round(zoomScale*100) }%</Navbar.Text>
      
      <Button
        className='rounded-circle mx-3'
        variant='outline-secondary'
        size='sm'
        onClick={ () => onZoomIn() }
        disabled={ zoomScale >= 2 ? true : false }
      >
        <AiOutlineZoomIn/>
      </Button>
    </div>
  )

  const renderSummaryButton = () => (
    <div>
      <Button
        className='mx-3'
        variant='outline-secondary'
        size='sm'
        onClick={ () => onSummaryClick() }    
      >
      Generate Summary
      </Button>
    </div>
  )

  const renderCrossRefBtn = () => (
    <div>
      <Button
        className='mx-3'
        variant='outline-secondary'
        size='sm'
        onClick={ () => onCrossRefClick() }    
      >
      Get Cross-References
      </Button>
    </div>
  )

  return (
    <>
      <Navbar bg='dark' variant='dark' className="justify-content-center mb-3">
        <Nav>
          { renderPageCounts() }
          { renderSummaryButton() }
          { renderCrossRefBtn() }
          { renderZoomButtons() }
        </Nav>
      </Navbar>
    </>
  );
}

ViewerNavbar.propTypes = {
  currentPage: PropTypes.number,
  totalPageCount: PropTypes.number,
  nextPage: PropTypes.func.isRequired,
  previousPage: PropTypes.func.isRequired,
  firstPage: PropTypes.func,
  lastPage: PropTypes.func,
  onZoomIn: PropTypes.func.isRequired,
  onZoomOut: PropTypes.func.isRequired,
  zoomScale: PropTypes.number,
  onCrossRefClick: PropTypes.func,
}

export default ViewerNavbar;