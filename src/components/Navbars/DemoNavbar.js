import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Container,
  InputGroup,
  InputGroupText,
  InputGroupAddon,
  Input,
} from "reactstrap";

import { adminRoutes, customerRoutes } from "routes.js";
import { setCurrency } from "store/currencySlice";
import { signOut } from "aws-amplify/auth";
function DemoNavbar(props) {
  const location = useLocation();
  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = React.useState(false);
  const [color, setColor] = React.useState("transparent");
  const sidebarToggle = React.useRef();
  const navigate = useNavigate();

  // List of available currencies
  const currencies = ["USD", "EUR", "GBP", "INR", "JPY"];

  // Handle currency change
  const handleCurrencyChange = (event) => {
    const selectedCurrency = event.target.value;
    dispatch(setCurrency(selectedCurrency)); // Dispatch the action to update the currency
  };

  const toggle = () => {
    if (isOpen) {
      setColor("transparent");
    } else {
      setColor("white");
    }
    setIsOpen(!isOpen);
  };

  const dropdownToggle = (e) => {
    setDropdownOpen(!dropdownOpen);
  };

  const accountDropdownToggle = (e) => {
    setAccountDropdownOpen(!accountDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      localStorage.clear();

      await signOut();

      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login");
    }
  };
  const allRoutes = [...adminRoutes, ...customerRoutes];
  const getBrand = () => {
    let name;
    allRoutes.map((prop, key) => {
      if (prop.path === location.pathname) {
        name = prop.name;
      }
      return null;
    });
    return name;
  };

  const openSidebar = () => {
    document.documentElement.classList.toggle("nav-open");
    sidebarToggle.current.classList.toggle("toggled");
  };

  const updateColor = () => {
    if (window.innerWidth < 993 && isOpen) {
      setColor("red");
    } else {
      setColor("transparent");
    }
  };

  React.useEffect(() => {
    window.addEventListener("resize", updateColor);
  }, []);

  React.useEffect(() => {
    if (
      window.innerWidth < 993 &&
      document.documentElement.className.indexOf("nav-open") !== -1
    ) {
      document.documentElement.classList.toggle("nav-open");
      sidebarToggle.current.classList.toggle("toggled");
    }
  }, [location]);

  return (
    <Navbar
      color={
        location.pathname.indexOf("full-screen-maps") !== -1 ? "white" : color
      }
      expand="lg"
      className={
        location.pathname.indexOf("full-screen-maps") !== -1
          ? "navbar-absolute fixed-top"
          : "navbar-absolute fixed-top " +
            (color === "transparent" ? "navbar-transparent " : "")
      }
    >
      <Container fluid>
        <div className="navbar-wrapper">
          <div className="navbar-toggle">
            <button
              type="button"
              ref={sidebarToggle}
              className={`navbar-toggler ${isOpen ? "open" : ""}`}
              onClick={openSidebar}
              style={{
                border: "none",
                background: "transparent",
                padding: "10px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "5px",
              }}
            >
              <span
                className="navbar-toggler-bar bar1"
                style={{
                  display: "block",
                  width: "30px",
                  height: "4px",
                  backgroundColor: "white",
                  margin: "6px 0",
                  transition: "0.3s ease-in-out",
                  transform: isOpen ? "translateY(8px) rotate(45deg)" : "none", // Adjusted for alignment
                }}
              />
              <span
                className="navbar-toggler-bar bar2"
                style={{
                  display: isOpen ? "none" : "block", // Hide the middle line when open
                  width: "30px",
                  height: "4px",
                  backgroundColor: "white",
                  margin: "6px 0",
                  transition: "0.3s ease-in-out",
                }}
              />
              <span
                className="navbar-toggler-bar bar3"
                style={{
                  display: "block",
                  width: "30px",
                  height: "4px",
                  backgroundColor: "white",
                  margin: "6px 0",
                  transition: "0.3s ease-in-out",
                  transform: isOpen
                    ? "translateY(-8px) rotate(-45deg)"
                    : "none", // Adjusted for alignment
                }}
              />
            </button>
          </div>

          <NavbarBrand href="/">{getBrand()}</NavbarBrand>
        </div>
        <Nav navbar>
          <Dropdown
            nav
            isOpen={accountDropdownOpen}
            toggle={accountDropdownToggle}
          >
            <DropdownToggle caret nav>
              <i className="now-ui-icons users_single-02" />
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default DemoNavbar;
