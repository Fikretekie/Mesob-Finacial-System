import React from "react";
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

function DemoNavbar(props) {
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = React.useState(false);
  const [color, setColor] = React.useState("transparent");
  const sidebarToggle = React.useRef();
  const navigate = useNavigate();

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

  const handleLogout = () => {
    localStorage.removeItem("user_email");
    navigate("/login");
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
              className="navbar-toggler"
              onClick={() => openSidebar()}
            >
              <span className="navbar-toggler-bar bar1" />
              <span className="navbar-toggler-bar bar2" />
              <span className="navbar-toggler-bar bar3" />
            </button>
          </div>
          <NavbarBrand href="/">{getBrand()}</NavbarBrand>
        </div>
        <NavbarToggler onClick={toggle}>
          <span className="navbar-toggler-bar navbar-kebab" />
          <span className="navbar-toggler-bar navbar-kebab" />
          <span className="navbar-toggler-bar navbar-kebab" />
        </NavbarToggler>
        <Collapse isOpen={isOpen} navbar className="justify-content-end">
          <form>
            <InputGroup className="no-border">
              <Input placeholder="Search..." />
              <InputGroupAddon addonType="append">
                <InputGroupText>
                  <i className="now-ui-icons ui-1_zoom-bold" />
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </form>
          <Nav navbar>
            <Dropdown
              nav
              isOpen={accountDropdownOpen}
              toggle={(e) => accountDropdownToggle(e)}
            >
              <DropdownToggle caret nav>
                <i className="now-ui-icons users_single-02" />
                <p>
                  <span className="d-lg-none d-md-block">Account</span>
                </p>
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </Nav>
        </Collapse>
      </Container>
    </Navbar>
  );
}

export default DemoNavbar;
