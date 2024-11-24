import React from 'react';
import ForumForm from '../components/ForumForm';
// import Navbar from '../components/Navbar';

const Index = () => {
  return (
    <div>
      <h1 style={{ textAlign: 'center', fontSize: '36px', color: '#007BFF', marginTop: '20px' }}>
  Welcome to the Autoflow Car Vehicle Forum
</h1>

      {/* <Navbar/> */}
      <ForumForm />
      
      
    </div>
  );
};

export default Index;
