import React from 'react';
import PropTypes from 'prop-types';
import Card from 'react-bootstrap/Card';
const DisplayCards = (props) => {
  const {
    data
  } = props;

  const renderCards = () => (
    <Card style={{ width: '18rem' }}>
      <Card.Body>
        <Card.Title>Card Title</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">Card Subtitle</Card.Subtitle>
      </Card.Body>
    </Card>
  )

  return (
    <div>
      { renderCards() }
    </div>
  )
} 

DisplayCards.propTypes = {
  data: PropTypes.object
};

export default DisplayCards;