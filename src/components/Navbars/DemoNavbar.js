// import React from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import {
//   Collapse,
//   Navbar,
//   NavbarToggler,
//   NavbarBrand,
//   Nav,
//   NavItem,
//   Dropdown,
//   DropdownToggle,
//   DropdownMenu,
//   DropdownItem,
//   Container,
//   InputGroup,
//   InputGroupText,
//   InputGroupAddon,
//   Input,
// } from "reactstrap";

// import { adminRoutes, customerRoutes } from "routes.js";
// import { setCurrency } from "store/currencySlice";
// import { signOut } from "aws-amplify/auth";
// function DemoNavbar(props) {
//   const location = useLocation();
//   const dispatch = useDispatch();

//   const [isOpen, setIsOpen] = React.useState(false);
//   const [dropdownOpen, setDropdownOpen] = React.useState(false);
//   const [accountDropdownOpen, setAccountDropdownOpen] = React.useState(false);
//   const [color, setColor] = React.useState("transparent");
//   const sidebarToggle = React.useRef();
//   const navigate = useNavigate();

//   // List of available currencies
//   const currencies = ["USD", "EUR", "GBP", "INR", "JPY"];

//   // Handle currency change
//   const handleCurrencyChange = (event) => {
//     const selectedCurrency = event.target.value;
//     dispatch(setCurrency(selectedCurrency)); // Dispatch the action to update the currency
//   };

//   const toggle = () => {
//     if (isOpen) {
//       setColor("transparent");
//     } else {
//       setColor("white");
//     }
//     setIsOpen(!isOpen);
//   };

//   const dropdownToggle = (e) => {
//     setDropdownOpen(!dropdownOpen);
//   };

//   const accountDropdownToggle = (e) => {
//     setAccountDropdownOpen(!accountDropdownOpen);
//   };

//   const handleLogout = async () => {
//     try {
//       localStorage.clear();

//       await signOut();

//       navigate("/login");
//     } catch (error) {
//       console.error("Logout error:", error);
//       navigate("/login");
//     }
//   };
//   const allRoutes = [...adminRoutes, ...customerRoutes];
//   const getBrand = () => {
//     let name;
//     allRoutes.map((prop, key) => {
//       if (prop.path === location.pathname) {
//         name = prop.name;
//       }
//       return null;
//     });
//     return name;
//   };

//   const openSidebar = () => {
//     document.documentElement.classList.toggle("nav-open");
//     sidebarToggle.current.classList.toggle("toggled");
//   };

//   const updateColor = () => {
//     if (window.innerWidth < 993 && isOpen) {
//       setColor("red");
//     } else {
//       setColor("transparent");
//     }
//   };

//   React.useEffect(() => {
//     window.addEventListener("resize", updateColor);
//   }, []);

//   React.useEffect(() => {
//     if (
//       window.innerWidth < 993 &&
//       document.documentElement.className.indexOf("nav-open") !== -1
//     ) {
//       document.documentElement.classList.toggle("nav-open");
//       sidebarToggle.current.classList.toggle("toggled");
//     }
//   }, [location]);

//   return (
//     <Navbar
//       color={
//         location.pathname.indexOf("full-screen-maps") !== -1 ? "white" : color
//       }
//       expand="lg"
//       className={
//         location.pathname.indexOf("full-screen-maps") !== -1
//           ? "navbar-absolute fixed-top"
//           : "navbar-absolute fixed-top " +
//             (color === "transparent" ? "navbar-transparent " : "")
//       }
//     >
//       <Container fluid>
//         <div className="navbar-wrapper">
//           <div className="navbar-toggle">
//             <button
//               type="button"
//               ref={sidebarToggle}
//               className={`navbar-toggler ${isOpen ? "open" : ""}`}
//               onClick={openSidebar}
//               style={{
//                 border: "none",
//                 background: "transparent",
//                 padding: "10px",
//                 cursor: "pointer",
//                 display: "flex",
//                 flexDirection: "column",
//                 justifyContent: "center",
//                 gap: "5px",
//               }}
//             >
//               <span
//                 className="navbar-toggler-bar bar1"
//                 style={{
//                   display: "block",
//                   width: "30px",
//                   height: "4px",
//                   backgroundColor: "white",
//                   margin: "6px 0",
//                   transition: "0.3s ease-in-out",
//                   transform: isOpen ? "translateY(8px) rotate(45deg)" : "none", // Adjusted for alignment
//                 }}
//               />
//               <span
//                 className="navbar-toggler-bar bar2"
//                 style={{
//                   display: isOpen ? "none" : "block", // Hide the middle line when open
//                   width: "30px",
//                   height: "4px",
//                   backgroundColor: "white",
//                   margin: "6px 0",
//                   transition: "0.3s ease-in-out",
//                 }}
//               />
//               <span
//                 className="navbar-toggler-bar bar3"
//                 style={{
//                   display: "block",
//                   width: "30px",
//                   height: "4px",
//                   backgroundColor: "white",
//                   margin: "6px 0",
//                   transition: "0.3s ease-in-out",
//                   transform: isOpen
//                     ? "translateY(-8px) rotate(-45deg)"
//                     : "none", // Adjusted for alignment
//                 }}
//               />
//             </button>
//           </div>

//           <NavbarBrand href="/">{getBrand()}</NavbarBrand>
//         </div>
//         <Nav navbar>
//           <Dropdown
//             nav
//             isOpen={accountDropdownOpen}
//             toggle={accountDropdownToggle}
//             className="account-dropdown"
//           >
//             <DropdownToggle caret nav>
//               <i className="now-ui-icons users_single-02" />
//             </DropdownToggle>
//             <DropdownMenu right style={{ backgroundColor: "white" }}>
//               <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
//             </DropdownMenu>
//           </Dropdown>
//         </Nav>
//       </Container>
//     </Navbar>
//   );
// }

// export default DemoNavbar;


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
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "reactstrap";

import { adminRoutes, customerRoutes } from "routes.js";
import { setCurrency } from "store/currencySlice";
import { signOut } from "aws-amplify/auth";

function DemoNavbar(props) {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = React.useState(false);
  const [helpModalOpen, setHelpModalOpen] = React.useState(false); // NEW: Help modal state

  const [color, setColor] = React.useState("transparent");
  const sidebarToggle = React.useRef();

  const currencies = ["USD", "EUR", "GBP", "INR", "JPY"];

  const handleCurrencyChange = (event) => {
    const selectedCurrency = event.target.value;
    dispatch(setCurrency(selectedCurrency));
  };

  const toggle = () => {
    if (isOpen) {
      setColor("transparent");
    } else {
      setColor("white");
    }
    setIsOpen(!isOpen);
  };

  const dropdownToggle = () => setDropdownOpen(!dropdownOpen);
  const accountDropdownToggle = () => setAccountDropdownOpen(!accountDropdownOpen);

  const toggleHelpModal = () => setHelpModalOpen(!helpModalOpen); // NEW: Toggle help modal

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
    allRoutes.forEach((prop) => {
      if (prop.path === location.pathname) {
        name = prop.name;
      }
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
    return () => window.removeEventListener("resize", updateColor);
  }, [isOpen]);

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
    <>
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
                    transform: isOpen ? "translateY(8px) rotate(45deg)" : "none",
                  }}
                />
                <span
                  className="navbar-toggler-bar bar2"
                  style={{
                    display: isOpen ? "none" : "block",
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
                      : "none",
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
              className="account-dropdown"
            >
              <DropdownToggle caret nav>
                <i className="now-ui-icons users_single-02" />
              </DropdownToggle>
              <DropdownMenu right style={{ backgroundColor: "white" }}>
                {/* NEW: Help & Support Item */}
                <DropdownItem onClick={toggleHelpModal}>
                  <i className="now-ui-icons ui-2_settings-90 mr-2" />
                  Help & Support
                </DropdownItem>

                <DropdownItem divider />

                <DropdownItem onClick={handleLogout}>
                  <i className="now-ui-icons ui-1_simple-remove mr-2" />
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </Nav>
        </Container>
      </Navbar>

      {/* ==================== HELP & SUPPORT MODAL ==================== */}

      <Modal isOpen={helpModalOpen} toggle={toggleHelpModal} centered>
        <ModalHeader toggle={toggleHelpModal} className="border-0 pb-0">
          <h4 className="mb-0">Help & Support</h4>
        </ModalHeader>

        <ModalBody className="text-center pt-3">
          <p className="text-muted mb-4">
            We're here to help! Reach out via any method below.
          </p>

          {/* Phone */}
          <div className="mb-4">
            <a
              href="tel:+1234567890"
              className="btn btn-icon btn-round btn-primary"
              style={{ width: "50px", height: "50px" }}
            >
              <i className="now-ui-icons tech_mobile"></i>
            </a>
            <div className="mt-2">
              <strong>Phone</strong>
              <br />
              <a href="tel:+1234567890">+1 (234) 567-890</a>
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <a
              href="mailto:support@mesobfinancial.com"
              className="btn btn-icon btn-round btn-info"
              style={{ width: "50px", height: "50px" }}
            >
              <i className="now-ui-icons ui-1_email-85"></i>
            </a>
            <div className="mt-2">
              <strong>Email</strong>
              <br />
              <a href="mailto:support@mesobfinancial.com">
                support@mesobfinancial.com
              </a>
            </div>
          </div>

          {/* Social Icons */}
          <div className="mt-4">
            <p className="fw-bold mb-3">Follow us on</p>
            <div className="d-flex justify-content-center align-items-center gap-4">
              {/* Facebook */}
              <a
                href="https://facebook.com/yourpage"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#1877F2", fontSize: "28px" }}
              >
                <i className="fab fa-facebook"></i>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#000000", fontSize: "28px" }}
              >
                <i className="fab fa-tiktok"></i>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#E4405F", fontSize: "28px" }}
              >
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="border-0 justify-content-center">
          <Button color="secondary" onClick={toggleHelpModal}>
            Close
          </Button>
        </ModalFooter>
      </Modal>



    </>
  );
}

export default DemoNavbar;