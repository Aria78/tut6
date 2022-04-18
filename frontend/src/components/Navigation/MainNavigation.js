import React from "react"
import { NavLink } from "react-router-dom"
import "./MainNavigation.css"
import AuthContext from '../../context/auth-context';

const mainNavigation = props => (
    <AuthContext.Consumer>
        {(context) => {
            return (
                <header className="main-navigation">
                    <div className="main-navigation__logo">
                        <h1>Singapore Railway</h1>
                        <p></p>
                        <h2>——Ticket request and reservation system</h2>
                    </div>
                    <nav className="main-navigation__items">
                        <ul>
                            {!context.token && (
                                <li><NavLink to="/auth">Log In</NavLink></li>
                            )}
                            <li><NavLink to="/events">All ticket requests</NavLink></li>
                            {context.token && (
                                <React.Fragment>
                                    <li>
                                        <NavLink to="/bookings">Reserved tickets</NavLink>
                                    </li>
                                    <li>
                                        <button onClick={context.logout}>Logout</button>
                                    </li>
                                </React.Fragment>
                            )}
                        </ul>
                    </nav>
                </header>
            )
        }}
    </AuthContext.Consumer>
)

export default mainNavigation