import Button from "@mui/material/Button";
import { Typography } from "@mui/material";
import React from "react";
import AdminSignup from "./AdminSignup";
import AdminSignin from "./AdminSignin";
import { Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "@mui/material/Card";
import HomeIcon from "@mui/icons-material/Home";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import Courses from "../admin-components/Courses";
import CoursesBeforeSignin from "./AdminCoursesBeforeSignin";

export default function Sidebar() {
  const token = localStorage.getItem("token");
  if (token === "") {
    return (
      <div
        style={{
          position: "fixed",
          top: "61px",
          left: "0",
          width: "230px",
          height: "calc(100%)",
        //   backgroundColor: "#fff3e0",
          padding: "10px",
          zIndex: "90",
          border: "1px solid white",
        }}
      >
        
        <FixedSidebar></FixedSidebar>
      </div>
    );
  } else {
    const [role, setRole] = useState("User");
    useEffect(() => {
      fetch("http://localhost:3000/role", {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          auth: "bearer " + localStorage.getItem("token"),
        },
      }).then((res) => {
        res.json().then((data) => {
          setRole(data.role);
        });
      });
    }, []);

    return (
      <>
        <div
          style={{
            position: "fixed",
            top: "61px",
            left: "0",
            width: "230px",
            height: "calc(100%)",
            // backgroundColor: "#fff3e0",
            padding: "10px",
            zIndex: "90",
            borderRight: "1px solid white",
          }}
        >
          <FixedSidebar role={role}></FixedSidebar>
          {/* <div style={{
      marginTop:'30px'
    }}><hr style={{
      borderTop:'2px solid black'
    }}/></div> */}
          <VariableSidebar></VariableSidebar>
        </div>
      </>
    );
  }
}

function FixedSidebar(props) {
  console.log(props.role);
  const role = props.role;
  return (
    <div>
      <ul
        style={{
          listStyle: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            // justifyContent:'space-between',
            marginTop: "80px",
          }}
        >
          <div
            style={{
              paddingRight: "20px",
            }}
          >
            <HomeIcon style={{ color: "white" }}></HomeIcon>
          </div>
          <div
            style={{
              marginTop: "3.5px",
            }}
          >
            <li>
              <Typography
                style={{
                  color: "black",
                }}
              >
                <Link to={"/admin"} style={{ color: "white" }}>
                  Home
                </Link>
              </Typography>
            </li>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            // justifyContent:'space-between',
            marginTop: "30px",
          }}
        >
          <div
            style={{
              paddingRight: "20px",
            }}
          >
            <MenuBookIcon style={{ color: "white" }}></MenuBookIcon>
          </div>
          <div
            style={{
              marginTop: "3.5px",
            }}
          >
            <li>
              <Typography
                style={{
                  color: "black",
                }}
              >
                {role === undefined ? (
                  <Link
                    to="/admin/admincoursesbeforesignin"
                    style={{ color: "white" }}
                  >
                    Courses
                  </Link>
                ) : (
                  <Link to="/admin/courses" style={{ color: "white" }}>
                    Courses
                  </Link>
                )}
              </Typography>
            </li>
          </div>
        </div>
      </ul>
      <div
        style={{
          marginTop: "30px",
        }}
      >
        <hr
          style={{
            borderTop: "2px solid white",
          }}
        />
      </div>
    </div>
  );
}

function VariableSidebar() {
  return (
    <div>
      <ul
        style={{
          listStyle: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            // justifyContent:'space-between',
            marginTop: "30px",
          }}
        >
          <div
            style={{
              paddingRight: "20px",
            }}
          >
            <ShoppingBasketIcon style={{ color: "white" }}></ShoppingBasketIcon>
          </div>
          <div
            style={{
              marginTop: "3.5px",
            }}
          >
            <li>
              <Typography
                style={{
                  color: "black",
                }}
              >
                <Link to="/admin/addcourse" style={{ color: "white" }}>
                  Add Course
                </Link>
              </Typography>
            </li>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            // justifyContent:'space-between',
            marginTop: "30px",
          }}
        >
          <div
            style={{
              paddingRight: "20px",
            }}
          >
            <SettingsIcon style={{ color: "white" }}></SettingsIcon>
          </div>
          <div
            style={{
              marginTop: "3.5px",
            }}
          >
            <li>
              <Typography
                style={{
                  color: "black",
                }}
              >
                <Link style={{ color: "white" }} to={"/admin/setting"}>
                  Setting
                </Link>
              </Typography>
            </li>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            // justifyContent:'space-between',
            marginTop: "30px",
          }}
        >
          <div
            style={{
              paddingRight: "20px",
            }}
          >
            <LogoutIcon style={{ color: "white" }}></LogoutIcon>
          </div>
          <div
            style={{
              marginTop: "3.5px",
            }}
          >
            <li>
              <Typography
                style={{
                  color: "black",
                }}
              >
                <Link
                  to={"/"}
                  onClick={() => {
                    localStorage.setItem("token", "");
                    window.location = "/admin";
                  }}
                  style={{
                    color: "white",
                  }}
                >
                  Log out
                </Link>
              </Typography>
            </li>
          </div>
        </div>
      </ul>
    </div>
  );
}
