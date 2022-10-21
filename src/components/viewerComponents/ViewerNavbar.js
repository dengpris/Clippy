
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
    lastPage
  } = props;
  return (
    <>
      <Navbar bg='light' variant='light'>
        <Nav>
          <div className='p-3'>
            <Button 
              variant='outline-secondary'
              size='sm'
              className='rounded-circle'
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
            <Navbar.Text className='pr-3 pl-3'> Page { currentPage } of { totalPageCount } </Navbar.Text>
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
              className='rounded-circle'
              onClick={ () => lastPage() }
              disabled={ currentPage === totalPageCount ? true : false }
            >
              <BsArrowBarRight/>
            </Button>
          </div>
        </Nav>
      </Navbar>
    </>
  );
}

ViewerNavbar.propTypes = {
  currentPage: PropTypes.number,
  totalPageCount: PropTypes.number,
  nextPage: PropTypes.func,
  previousPage: PropTypes.func,
  firstPage: PropTypes.func,
  lastPage: PropTypes.func
}

export default ViewerNavbar;