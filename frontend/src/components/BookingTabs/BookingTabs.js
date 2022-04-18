import React from 'react'
import './BookingTabs.css'

const bookingTabs = props => {
  return (
    <div className="booking-tabs">
      <button
        className={props.activeTab === "List" ? "active" : ""}
        onClick={() => props.onTabClick("List")}
      >
        Reserved Ticket List
      </button>
    </div>
  )
}

export default bookingTabs