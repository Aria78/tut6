import React, { Component } from 'react'
import Modal from '../components/Modal/Modal'
import Backdrop from '../components/Backdrop/Backdrop'
import './Events.css'
import AuthContext from '../context/auth-context';
import EventList from '../components/EventList/EventList'
import Spinner from '../components/Spinner/Spinner'

class EventsPage extends Component {
  // react will automatically populate this.context now
  static contextType = AuthContext;

  state = {
    creating: false,
    detailVisiting: false,
    events: [],
    isLoading: false,
    selectedEvent: null,
  }

  isActive = true

  constructor(props) {
    super(props)
    this.serialNumberEl = React.createRef()
    this.phoneNumberEl = React.createRef()
    this.dateEl = React.createRef()
    this.nameEl = React.createRef()
  }

  componentDidMount() {
    this.fetchEvents()
  }

  componentWillUnmount() {
    this.isActive = false
  }

  createEventHandler = () => {
    this.setState({ creating: true })
  }

  handleOnCancel = () => {
    this.setState({ creating: false, detailVisiting: false })
  }

  handleOnBook = () => {
    const token = this.context.token
    if (!token) {
      // this was an "OK button click", so just close the modal
      this.setState({ selectedEvent: null, detailVisiting: false })
      return
    }
    const { selectedEvent } = this.state
    const requestBody = {
      query: `
        mutation BookEvent($id: ID!) {
          bookEvent(eventId: $id) {
            _id
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        id: selectedEvent._id
      }
    }

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }).then(res => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Failed')
      }
      return res.json()
    }).then(resData => {
      console.log(resData.data.bookEvent)
      // close the modal
      this.setState({ selectedEvent: null, detailVisiting: false })
    }).catch(err => {
      console.log(err)
    })
  }

  handleOnConfirm = () => {
    this.setState({ creating: false })
    const serialNumber = this.serialNumberEl.current.value
    const phoneNumber = this.phoneNumberEl.current.value
    const date = this.dateEl.current.value
    const name = this.nameEl.current.value

    if (serialNumber.trim().length === 0 || phoneNumber.trim().length === 0
    || date.trim().length === 0 || name.trim().length === 0) return

    const requestBody = {
      query: `
        mutation CreateEvent($serialNumber: String!, $name: String!, $phoneNumber: Float!, $date: String!) {
          createEvent(eventInput: {serialNumber: $serialNumber, name: $name, phoneNumber: $phoneNumber, date: $date}) {
            _id
            serialNumber
            name
            phoneNumber
            date
          }
        }
      `,
      variables: {
        serialNumber,
        name,
        phoneNumber: Number(phoneNumber),
        date
      }
    }

    const token = this.context.token

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }).then(res => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Failed')
      }
      return res.json()
    }).then(resData => {
      this.setState(prevState => {
        const { _id, serialNumber, name, phoneNumber, date } = resData.data.createEvent
        const event = {
          _id,
          serialNumber,
          name,
          phoneNumber,
          date,
          creator: {
            _id: this.context.userId
          }
        }
        const events = [...prevState.events, event]
        return { events }
      })
    }).catch(err => {
      console.log(err)
    })
  }

  handleOnDetailPress = event => {
    this.setState({ detailVisiting: true, selectedEvent: event })
  }

  fetchEvents() {
    this.setState({ isLoading: true })
    const requestBody = {
      query: `
        query {
          events {
            _id
            serialNumber
            name
            phoneNumber
            date
            creator {
              _id
              email
            }
          }
        }
      `
    }

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Failed')
      }
      return res.json()
    }).then(resData => {
      if (!this.isActive) return
      const events = resData.data.events
      this.setState({ events, isLoading: false })
    }).catch(err => {
      console.log(err)
      this.setState({ isLoading: false })
    })
  }

  render() {
    const token = this.context.token
    return (
      <React.Fragment>
        {this.state.creating && (
          <React.Fragment>
            <Backdrop />
            <Modal title="Add Ticket Request" canCancel canConfirm onCancel={this.handleOnCancel} onConfirm={this.handleOnConfirm} confirmText="Add">
              <form onSubmit={this.submitHandler}>
                <div className="form-control">
                  <label htmlFor={"serialNumber"}>Serial Number</label>
                  <input type={"text"} id={"serialNumber"} ref={this.serialNumberEl} />
                </div>
                <div className="form-control">
                  <label htmlFor={"name"}>Traveler Name</label>
                  <input type={"text"} id={"name"} ref={this.nameEl} />
                </div>
                <div className="form-control">
                  <label htmlFor={"phoneNumber"}>Phone Number</label>
                  <input type={"number"} id={"phoneNumber"} ref={this.phoneNumberEl} />
                </div>
                <div className="form-control">
                  <label htmlFor={"date"}>Date</label>
                  <input type={"datetime-local"} id={"date"} ref={this.dateEl} />
                </div>
          
              </form>
            </Modal>
          </React.Fragment>
        )}
        {this.state.detailVisiting && (
          <React.Fragment>
            <Backdrop />
            <Modal title={this.state.selectedEvent.serialNumber} canCancel={!!token} canConfirm onCancel={this.handleOnCancel} onConfirm={this.handleOnBook} confirmText={token ? "Approve and Reserve This Ticket" : "Ok"}>
              <p>Serial Number: {this.state.selectedEvent.serialNumber}</p>
              <p>Name: {this.state.selectedEvent.name}</p>
              <p>Phone Number: {this.state.selectedEvent.phoneNumber} </p>
              <p>Time Stamp: {(new Date(this.state.selectedEvent.date)).toLocaleDateString()}</p>
              
            </Modal>
          </React.Fragment>
        )}
        {this.context.token && <div className="events-control">
          <p>Instructions: Please add your ticket requests first.</p>
          <button className="btn" onClick={this.createEventHandler}>Add new ticket requests</button>
        </div>}
        {this.state.isLoading ? <Spinner /> : <EventList events={this.state.events} onDetailPress={this.handleOnDetailPress} />}
      </React.Fragment>
    )
  }
}

export default EventsPage