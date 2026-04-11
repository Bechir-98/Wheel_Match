import React from 'react';
import { Container, Accordion } from 'react-bootstrap';

function FAQ() {
  return (
    <Container style={{ marginTop: '100px', marginBottom: '60px' }}>
      <h1 className="text-center mb-5" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
        Frequently Asked Questions
      </h1>
      <Accordion defaultActiveKey="0">
        <Accordion.Item eventKey="0">
          <Accordion.Header>1. What is Wheel Match?</Accordion.Header>
          <Accordion.Body>
            Wheel Match is a platform that connects patients, clinicians, and vendors to help find the most suitable wheelchair based on individual needs and preferences.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="1"> 
          <Accordion.Header>2. How do I get started?</Accordion.Header>
          <Accordion.Body>
            Simply click on "Sign Up" or "Start as" from the homepage and choose your role (Patient, Clinician, or Vendor) to begin the onboarding process.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="2">
          <Accordion.Header>3. Is the platform free to use?</Accordion.Header>
          <Accordion.Body>
            Yes! Creating an account and getting matched with a wheelchair recommendation is completely free. Some services or vendor offerings may have costs.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="3">
          <Accordion.Header>4. Can I edit my personal or medical info later?</Accordion.Header>
          <Accordion.Body>
            Yes. After signing in, you can go to your profile to update personal information, medical history, or preferences at any time.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="4">
          <Accordion.Header>5. How are wheelchair recommendations made?</Accordion.Header>
          <Accordion.Body>
            Our system uses a combination of patient input, clinical data, and vendor inventory to recommend the most suitable wheelchairs based on function, comfort, and fit.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="5">
          <Accordion.Header>6. How can clinicians contribute?</Accordion.Header>
          <Accordion.Body>
            Clinicians play a key role by assessing patient mobility, adding medical notes, and validating patient information for more accurate matching.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="6">
          <Accordion.Header>7. What do vendors do on the platform?</Accordion.Header>
          <Accordion.Body>
            Vendors receive qualified leads, offer personalized wheelchair options, and can schedule fittings or test sessions with patients.
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="7">
          <Accordion.Header>8. How can I contact support?</Accordion.Header>
          <Accordion.Body>
            You can email us at <strong>support@wheelmatch.com</strong> or call us at <strong>+216 92195666</strong>. We’re happy to help!
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Container>
  );
}

export default FAQ;
