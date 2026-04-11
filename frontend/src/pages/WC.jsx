
import React from 'react';
import ArrowButton from  '../components/bouton_f.jsx';


function WcPage() {
  return (<>
    <div className='wcc'>
      <h1 className='wc'>Welcome to Wheel Match</h1>
         <h3 style={ {color: ''} }>The home of wheelchaires
          where you find your match .
         </h3>

         
    </div>
    <div className="arbt">
      <ArrowButton />
    </div>
    </>
    
  );
}

export default WcPage;
