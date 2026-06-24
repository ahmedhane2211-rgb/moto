import {useState} from "react";
import {NavLink, useNavigate} from "react-router-dom";
import "../../src/App.css";
import "../../src/index.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSignOutAlt} from "@fortawesome/free-solid-svg-icons";
import logo from "../logo-dark.svg";

import {
    faHome,
    faSackDollar,
    faIdCard,
    faComments,
    faStar,
    faGear
} from "@fortawesome/free-solid-svg-icons";
import Can from "./Can";
import {useTheme} from "../context/ThemeContext";
// import { width } from "@fortawesome/free-brands-svg-icons/fa11ty";

function AdminNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const {theme, toggleTheme} = useTheme();
    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const closeSidebar = () => {
        setIsOpen(false);
    };
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userType");
        localStorage.removeItem("userName");
        navigate("/login", {replace: true});
    };

    return (
        <>
            <nav className="navbar">
                <div className="navbar-container">
                    <button className="menu-btn"
                        onClick={toggleSidebar}>
                        ☰
                    </button>
                    <div style={{display:"flex",alignItems:"center",gap:"10px"}} className="navbar-title">
                        <label className="switch"
                            title={
                                theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"
                        }>
                            <span className="sun">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <g fill="#ffd43b">
                                        <circle r="5" cy="12" cx="12"></circle>
                                        <path d="m21 13h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm-17 0h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm13.66-5.66a1 1 0 0 1 -.66-.29 1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1 -.75.29zm-12.02 12.02a1 1 0 0 1 -.71-.29 1 1 0 0 1 0-1.41l.71-.66a1 1 0 0 1 1.41 1.41l-.71.71a1 1 0 0 1 -.7.24zm6.36-14.36a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm0 17a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm-5.66-14.66a1 1 0 0 1 -.7-.29l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.29zm12.02 12.02a1 1 0 0 1 -.7-.29l-.66-.71a1 1 0 0 1 1.36-1.36l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.24z"></path>
                                    </g>
                                </svg>
                            </span>
                            <span className="moon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                                    <path d="m223.5 32c-123.5 0-223.5 100.3-223.5 224s100 224 223.5 224c60.6 0 115.5-24.2 155.8-63.4 5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6-96.9 0-175.5-78.8-175.5-176 0-65.8 36-123.1 89.3-153.3 6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"></path>
                                </svg>
                            </span>
                            <input type="checkbox" className="input"
                                checked={
                                    theme === "dark"
                                }
                                onChange={toggleTheme}/>
                            <span className="slider"></span>
                        </label>
                        <img src={logo}
                            alt="اللوجو"
                            style={
                                {width: "30px"}
                            }/>
                    </div>
                </div>
            </nav>

            {
            isOpen && <div className=""
                onClick={closeSidebar}></div>
        }

            <div className={
                `sidebar ${
                    isOpen ? "open" : ""
                }`
            }>
                <button className="close-btn"
                    onClick={closeSidebar}>
                    ×
                </button>
                <ul> {/* <li className="section-title">النظام</li> */}
                    <Can permission="admin_show">
                        
                        <button onClick={handleLogout}
                            className="logout-btn ">
                            <FontAwesomeIcon icon={faSignOutAlt}/>
                            تسجيل الخروج
                        </button>

                        <hr/>

                        <li>
                            <NavLink to="/admin/sub-admins"
                                onClick={closeSidebar}
                                className={
                                    ({isActive}) => (isActive ? "active" : "")
                            }>
                                <FontAwesomeIcon icon={faHome}/>
                                المستخدمون
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/complaints"
                                onClick={closeSidebar}
                                className={
                                    ({isActive}) => (isActive ? "active" : "")
                            }>
                                <FontAwesomeIcon icon={faComments}/>
                                الشكاوي والاقتراحات
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/admin/reviews"
                                onClick={closeSidebar}
                                className={
                                    ({isActive}) => (isActive ? "active" : "")
                            }>
                                <FontAwesomeIcon icon={faStar}/>
                                التقييمات
                            </NavLink>
                        </li>
                    </Can>
                    <Can permission="subscriber_show">
                        <li>
                            <NavLink to="/admin/subscriptions"
                                onClick={closeSidebar}
                                className={
                                    ({isActive}) => (isActive ? "active" : "")
                            }>
                                <FontAwesomeIcon icon={faSackDollar}/>
                                الإشتراكات
                            </NavLink>
                        </li>
                    </Can>
										<li>
                            <NavLink to="/admin/settings"
                                onClick={closeSidebar}
                                className={
                                    ({isActive}) => isActive ? "active" : ""
                            }>
                                <FontAwesomeIcon icon={faGear}/>
                                الإعدادات
                            </NavLink>
                        </li>
                    {/* <Can permission="admin_show">
            <li>
              <NavLink
                to="/admin/subscribtions-details"
                onClick={closeSidebar}
                className={({ isActive }) => (isActive ? "active" : "")}>
                <FontAwesomeIcon icon={faIdCard} /> تفاصيل المشتركين
              </NavLink>
            </li>
          </Can> */} </ul>
            </div>
        </>
    );
}

export default AdminNavbar;
