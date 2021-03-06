import React from 'react'
import './EventListItem.css'
import AuthContext from '../../../context/auth-context'

class EventListItem extends React.Component {
  static contextType = AuthContext
  render() {
    const { name, phoneNumber, creator, date} = this.props.event
    const authUserId = this.context.userId
    const isOwner = creator._id === authUserId
    const dateStr = (new Date(date)).toLocaleDateString()
    return (
      <li className="event__list__item">
        <div>
          <h1>{name}</h1>
          <h2>{`${phoneNumber}, ${dateStr}`}</h2>
        </div>
        <div>
          {!isOwner && <button className={"btn"} onClick={this.props.onDetailPress}>View Details</button>}
          {isOwner && <button className={"btn"} onClick={this.props.onDetailPress}>View Details</button>}
        </div>
      </li>
    )
  }
}

export default EventListItem
