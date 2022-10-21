
import './viewerComponents.css';

import React from 'react';
import PropTypes from 'prop-types';
import { BsArrowRight, BsArrowLeft } from 'react-icons/bs';
import { Button, Nav, Navbar } from 'react-bootstrap';

const ViewerNavbar = (props) => {
  const {
    currentPage,
    totalPageCount,
    nextPage,
    previousPage
  } = props;
  return (
    <>
      <Navbar bg='light' variant='light'>
        <Nav>
          <div className='p-3'>
            <Button 
              variant='outline-secondary'
              size='sm'
              onClick={ () => previousPage() }
              disabled={ currentPage === 1 ? true : false }
            >
              <BsArrowLeft/>
              Previous Page
            </Button>
            <Navbar.Text className='pr-3 pl-3'> Page { currentPage } of { totalPageCount } </Navbar.Text>
            <Button 
              variant='outline-secondary'
              size='sm'
              onClick={ () => nextPage() }
              disabled={ currentPage === totalPageCount ? true : false }
            >
              Next Page
              <BsArrowRight/>
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
  previousPage: PropTypes.func
}

export default ViewerNavbar;