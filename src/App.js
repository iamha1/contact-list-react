import logo from './logo.svg';
import './App.css';
import ContactForm from './components/ContactForm';
import ContactModal from './components/ContactModal';
import ContactTable from './components/ContactTable';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from 'react-bootstrap'
import React from 'react';

const SERVICE_URL = "https://tsg-contactlist.herokuapp.com"

class App extends React.Component {

  state = {
    loading: false,
    showEditModal: false,
    contactData: [
      {
        "contactId": 1, "firstName": "Fake",
        "lastName": "Data",
        "company": "Unknown Inc.",
        "phone": "000-0000",
        "email": "fakedata@unknown.io"
      }],
      newContactData: {
        firstName: '',
        lastName: '',
        company: '',
        phone: '',
        email: ''
      },
      editContactData: {
        "contactId": 42,
        "firstName": "Zaphod",
        "lastName": "Beeblebrox",
        "company": "Heart of Gold",
        "phone": "000-0000",
        "email": "prez@badnews.us"
      },
      addFormErrors : {
        firstName : '',
        lastName : '',
        company : '',
        phone : '',
        email : ''
      },

      editFormErrors : {
        firstName : '',
        lastName : '',
        company : '',
        phone : '',
        email : ''
      }
  }

  handleDeleteContact = (event) => {
    if (event) event.preventDefault();
    let contactId = event.target.value;
    console.log(`Submitting delete for contact id ${contactId}`)

    fetch(SERVICE_URL+'/contact/'+contactId, {
        method: 'DELETE',
    })
    .then(data => {
        this.loadContactData();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

  handleEditFormChange = (event) => {

    let inputName = event.target.name;
    let inputValue = event.target.value;
    let contactInfo = this.state.editContactData;

    console.log(`Something changed in ${inputName} : ${inputValue}`)

    if(contactInfo.hasOwnProperty(inputName)){
        contactInfo[inputName] = inputValue;
        this.setState({ editContactData : contactInfo })
    }

}

handleEditFormSubmit = (event) => {
    if (event) event.preventDefault();
    let contactId = event.target.value;
    console.log(`Submitting edit for contact id ${contactId}`)
    console.log(this.state.editContactData)

    let validationErrors = this.validateContact(this.state.editContactData)
    if(!validationErrors.isValid){
      console.log("Edited contact is invalid. Reporting errors.")
      this.setState({editFormErrors : validationErrors})
      return
    }

    fetch(SERVICE_URL+'/contact/'+contactId, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.state.editContactData),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        this.setState({ showEditModal : false, editFormErrors: validationErrors })
        this.loadContactData();
    })
    .catch((error) => {
        console.error('Error:', error);
    });

}

  handleEditModalClose = (event) => {
    console.log("Closing Edit Modal")
    this.setState({ showEditModal : false})
}

handleEditModalOpen = (event) => {
    console.log("Opening Edit Modal")
    if (event) event.preventDefault();

    let contactId = event.target.value;
    console.log(`Editing contact id ${contactId}`)

     // submit a GET request to the /contact/{contactId} endpoint
      // the response should come back with the associated contact's JSON
      fetch(SERVICE_URL+'/contact/'+contactId)
      .then(response => response.json())
      .then(data => {
          console.log('Success:', data);
          this.setState(
            { editContactData : data , showEditModal : true}
          )
      })
      .catch((error) => {
          console.error('Error:', error);
      });
}



  handleAddFormChange = (event) => {
    // The event triggering this function should be an input's onChange event
    // We need to grab the input's name & value so we can associate it with the
    // newContactData within the App's state.
    let inputName = event.target.name;
    let inputValue = event.target.value;
    let contactInfo = this.state.newContactData;

    console.log(`Updating new contact data: ${inputName} : ${inputValue}`)

    if (contactInfo.hasOwnProperty(inputName)) {
      contactInfo[inputName] = inputValue;
      this.setState({ newContactData: contactInfo })
    }
  }

  handleAddFormSubmit = (event) => {
    console.log("Adding contact!")
    if (event) event.preventDefault();

    fetch(SERVICE_URL + '/contact/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.state.newContactData),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Add Contact - Success:', data);
        this.setState({ newContactData: { firstName: '', lastName: '', company: '', phone: '', email: '' } })
        this.loadContactData();
      })
      .catch((error) => {
        console.log('Add Contact - Error:')
        console.log(error)
      });
  }

  loadContactData() {
    this.setState({ loading: true })
    console.log("Loading contact data")
    fetch(SERVICE_URL + "/contacts")
      .then(data => data.json())
      .then(data => this.setState(
        { contactData: data, loading: false }
      ))
  }

  componentDidMount() {
    console.log("App is now mounted.")
    this.loadContactData();
  }

render() {
  return (
    <Container fluid>
      <Row>
        <Col>
          <h1 className="text-center">Contact Application</h1>
        </Col>
        <hr />
      </Row>

      <Row>
        <Col sm={8}>
          <h2>My Contacts</h2>
          <ContactTable 
          contacts={this.state.contactData}
          handleEdit={this.handleEditModalOpen}
          handleDelete={this.handleDeleteContact}

          />
        </Col>

        <Col sm={4}>
          <h2>Add New Contact</h2>
          <ContactForm 
            handleSubmit={this.handleAddFormSubmit}
            handleChange={this.handleAddFormChange}          
            contactData={this.state.newContactData}
            contactErrors={this.state.addFormErrors}
            />
        </Col>
      </Row>
      <Row>
        <Col> 
      <ContactModal
         show={this.state.showEditModal}
         handleSubmit={this.handleEditFormSubmit}
         handleChange={this.handleEditFormChange}
         handleClose={this.handleEditModalClose}
         contactData={this.state.editContactData}
         contactErrors={this.state.editFormErrors} />
         </Col>
</Row>
    </Container>
  );
}
}

export default App;
