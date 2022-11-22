
import './viewerComponents.css';

import React from 'react';
import PropTypes from 'prop-types';
import { BsArrowRight, BsArrowLeft, BsArrowBarRight, BsArrowBarLeft } from 'react-icons/bs';
import { Button, Nav, Navbar } from 'react-bootstrap';

const ViewerNavbar = (props) => {
  const {
    currentPage,
    totalPageCount,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    onZoomIn,
    onZoomOut
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
        onClick={ () => onZoomIn() }
      >
        +
      </Button>
      <Button
        onClick={ () => onZoomOut() }
      >
        -
      </Button>
    </div>
  )

  return (
    <>
      <Navbar bg='light' variant='light'>
        <Nav>
          { renderPageCounts() }
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
  onZoomOut: PropTypes.func.isRequired
}

export default ViewerNavbar;