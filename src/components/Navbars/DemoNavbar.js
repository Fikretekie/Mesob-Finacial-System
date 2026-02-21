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
//   Modal,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   Button,
// } from "reactstrap";

// import { adminRoutes, customerRoutes } from "routes.js";
// import { setCurrency } from "store/currencySlice";
// import { signOut } from "aws-amplify/auth";

// function DemoNavbar(props) {
//   const location = useLocation();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const [isOpen, setIsOpen] = React.useState(false);
//   const [dropdownOpen, setDropdownOpen] = React.useState(false);
//   const [accountDropdownOpen, setAccountDropdownOpen] = React.useState(false);
//   const [helpModalOpen, setHelpModalOpen] = React.useState(false); // NEW: Help modal state

//   const [color, setColor] = React.useState("transparent");
//   const sidebarToggle = React.useRef();

//   const currencies = ["USD", "EUR", "GBP", "INR", "JPY"];

//   const handleCurrencyChange = (event) => {
//     const selectedCurrency = event.target.value;
//     dispatch(setCurrency(selectedCurrency));
//   };

//   const toggle = () => {
//     if (isOpen) {
//       setColor("transparent");
//     } else {
//       setColor("white");
//     }
//     setIsOpen(!isOpen);
//   };

//   const dropdownToggle = () => setDropdownOpen(!dropdownOpen);
//   const accountDropdownToggle = () => setAccountDropdownOpen(!accountDropdownOpen);

//   const toggleHelpModal = () => setHelpModalOpen(!helpModalOpen); // NEW: Toggle help modal
// {/* Define outside or above the return */}
// const socialLinks = [
//   { href: "https://www.facebook.com/profile.php?id=61579534023491", icon: "fab fa-facebook", color: "#1877F2", glow: "rgba(24,119,242,0.35)" },
//   { href: "https://www.tiktok.com/@mesob85?_t=ZT-8yzttOuwr1r&_r=1", icon: "fab fa-tiktok", color: "#ffffff", glow: "rgba(255,255,255,0.15)" },
//   { href: "https://www.instagram.com/mesobfinancial?igsh=eWNoNWNoaG45cHI0", icon: "fab fa-instagram", color: "#E4405F", glow: "rgba(228,64,95,0.35)" },
// ];
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
//     allRoutes.forEach((prop) => {
//       if (prop.path === location.pathname) {
//         name = prop.name;
//       }
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
//     return () => window.removeEventListener("resize", updateColor);
//   }, [isOpen]);

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
//     <>
//       <Navbar
//         color={
//           location.pathname.indexOf("full-screen-maps") !== -1 ? "white" : color
//         }
//         expand="lg"
//         className={
//           location.pathname.indexOf("full-screen-maps") !== -1
//             ? "navbar-absolute fixed-top"
//             : "navbar-absolute fixed-top " +
//             (color === "transparent" ? "navbar-transparent " : "")
//         }
//       >
//         <Container fluid>
//           <div className="navbar-wrapper">
//             <div className="navbar-toggle">
//               <button
//                 type="button"
//                 ref={sidebarToggle}
//                 className={`navbar-toggler ${isOpen ? "open" : ""}`}
//                 onClick={openSidebar}
//                 style={{
//                   border: "none",
//                   background: "transparent",
//                   padding: "10px",
//                   cursor: "pointer",
//                   display: "flex",
//                   flexDirection: "column",
//                   justifyContent: "center",
//                   gap: "5px",
//                 }}
//               >
//                 <span
//                   className="navbar-toggler-bar bar1"
//                   style={{
//                     display: "block",
//                     width: "30px",
//                     height: "4px",
//                     backgroundColor: "white",
//                     margin: "6px 0",
//                     transition: "0.3s ease-in-out",
//                     transform: isOpen ? "translateY(8px) rotate(45deg)" : "none",
//                   }}
//                 />
//                 <span
//                   className="navbar-toggler-bar bar2"
//                   style={{
//                     display: isOpen ? "none" : "block",
//                     width: "30px",
//                     height: "4px",
//                     backgroundColor: "white",
//                     margin: "6px 0",
//                     transition: "0.3s ease-in-out",
//                   }}
//                 />
//                 <span
//                   className="navbar-toggler-bar bar3"
//                   style={{
//                     display: "block",
//                     width: "30px",
//                     height: "4px",
//                     backgroundColor: "white",
//                     margin: "6px 0",
//                     transition: "0.3s ease-in-out",
//                     transform: isOpen
//                       ? "translateY(-8px) rotate(-45deg)"
//                       : "none",
//                   }}
//                 />
//               </button>
//             </div>

//             <NavbarBrand href="/">{getBrand()}</NavbarBrand>
//           </div>

//           <Nav navbar>
//             <Dropdown
//               nav
//               isOpen={accountDropdownOpen}
//               toggle={accountDropdownToggle}
//               className="account-dropdown"
//             >
//               <DropdownToggle caret nav>
//                 <i className="now-ui-icons users_single-02" />
//               </DropdownToggle>
//               <DropdownMenu right style={{ backgroundColor: "white" }}>
//                 {/* NEW: Help & Support Item */}
//                 <DropdownItem onClick={toggleHelpModal}>
//                   <i className="now-ui-icons ui-2_settings-90 mr-2" />
//                   Help & Support
//                 </DropdownItem>

//                 <DropdownItem divider />

//                 <DropdownItem onClick={handleLogout}>
//                   <i className="now-ui-icons ui-1_simple-remove mr-2" />
//                   Logout
//                 </DropdownItem>
//               </DropdownMenu>
//             </Dropdown>
//           </Nav>
//         </Container>
//       </Navbar>

//       {/* ==================== HELP & SUPPORT MODAL ==================== */}

//    <Modal
//   isOpen={helpModalOpen}
//   toggle={toggleHelpModal}
//   centered
//   modalClassName="dark-modal"
//   contentClassName="bg-transparent border-0 shadow-none"
// >
//   <ModalHeader
//     toggle={toggleHelpModal}
//     style={{
//       background: "#111827",
//       borderBottom: "1px solid #1e293b",
//       borderRadius: "18px 18px 0 0",
//       padding: "1.1rem 1.5rem",
//     }}
//   >
//     <span style={{ color: "#ffffff", fontWeight: 700, fontSize: "1.1rem" }}>
//       Help & Support
//     </span>
//   </ModalHeader>

//   <ModalBody style={{ background: "#0d1117", padding: "2rem 1.75rem" }}>
//     <p style={{
//       color: "#64748b",
//       textAlign: "center",
//       marginBottom: "2rem",
//       fontSize: "0.9rem",
//     }}>
//       We're here to help! Reach out via any method below.
//     </p>

//     {/* Contact Cards */}
//     <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.75rem" }}>

//       {/* Phone */}
//       <a href="tel:+16149665005" style={{ textDecoration: "none" }}>
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "1rem",
//             background: "rgba(30,41,59,0.6)",
//             border: "1px solid rgba(59,130,246,0.15)",
//             borderRadius: "12px",
//             padding: "1rem 1.25rem",
//             transition: "all 0.25s ease",
//             cursor: "pointer",
//           }}
//           onMouseEnter={e => {
//             e.currentTarget.style.border = "1px solid rgba(59,130,246,0.45)";
//             e.currentTarget.style.background = "rgba(59,130,246,0.08)";
//           }}
//           onMouseLeave={e => {
//             e.currentTarget.style.border = "1px solid rgba(59,130,246,0.15)";
//             e.currentTarget.style.background = "rgba(30,41,59,0.6)";
//           }}
//         >
//           <div style={{
//             width: "44px", height: "44px", flexShrink: 0,
//             background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
//             borderRadius: "12px",
//             display: "flex", alignItems: "center", justifyContent: "center",
//             boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
//           }}>
//             <i className="now-ui-icons tech_mobile" style={{ color: "#fff", fontSize: "18px" }} />
//           </div>
//           <div>
//             <p style={{ color: "#94a3b8", fontSize: "0.72rem", margin: 0, letterSpacing: "0.06em", textTransform: "uppercase" }}>Phone</p>
//             <p style={{ color: "#e2e8f0", fontWeight: 600, margin: 0, fontSize: "0.95rem" }}>+1 (614) 966-5005</p>
//           </div>
//         </div>
//       </a>

//       {/* Email */}
//       <a href="mailto:info@mesobfinancial.com" style={{ textDecoration: "none" }}>
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "1rem",
//             background: "rgba(30,41,59,0.6)",
//             border: "1px solid rgba(99,102,241,0.15)",
//             borderRadius: "12px",
//             padding: "1rem 1.25rem",
//             transition: "all 0.25s ease",
//             cursor: "pointer",
//           }}
//           onMouseEnter={e => {
//             e.currentTarget.style.border = "1px solid rgba(99,102,241,0.45)";
//             e.currentTarget.style.background = "rgba(99,102,241,0.08)";
//           }}
//           onMouseLeave={e => {
//             e.currentTarget.style.border = "1px solid rgba(99,102,241,0.15)";
//             e.currentTarget.style.background = "rgba(30,41,59,0.6)";
//           }}
//         >
//           <div style={{
//             width: "44px", height: "44px", flexShrink: 0,
//             background: "linear-gradient(135deg,#6366f1,#4338ca)",
//             borderRadius: "12px",
//             display: "flex", alignItems: "center", justifyContent: "center",
//             boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
//           }}>
//             <i className="now-ui-icons ui-1_email-85" style={{ color: "#fff", fontSize: "18px" }} />
//           </div>
//           <div>
//             <p style={{ color: "#94a3b8", fontSize: "0.72rem", margin: 0, letterSpacing: "0.06em", textTransform: "uppercase" }}>Email</p>
//             <p style={{ color: "#e2e8f0", fontWeight: 600, margin: 0, fontSize: "0.95rem" }}>info@mesobfinancial.com</p>
//           </div>
//         </div>
//       </a>
//     </div>

//     {/* Divider */}
//     <div style={{ borderTop: "1px solid #1e293b", marginBottom: "1.5rem" }} />

//     {/* Social */}
//     <p style={{
//       color: "#64748b", fontSize: "0.75rem", textAlign: "center",
//       textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem",
//     }}>
//       Follow us on
//     </p>

//     <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
// {socialLinks.map((item) => (
//   <a
//     key={item.href}
//     href={item.href}
//     target="_blank"
//     rel="noopener noreferrer"
//     style={{
//       width: "46px",
//       height: "46px",
//       background: "rgba(30,41,59,0.7)",
//       border: "1px solid #1e293b",
//       borderRadius: "12px",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       color: item.color,
//       fontSize: "20px",
//       transition: "all 0.25s ease",
//       textDecoration: "none",
//     }}
//     onMouseEnter={(e) => {
//       e.currentTarget.style.boxShadow = `0 4px 16px ${item.glow}`;
//       e.currentTarget.style.borderColor = item.color;
//       e.currentTarget.style.background = "rgba(30,41,59,1)";
//     }}
//     onMouseLeave={(e) => {
//       e.currentTarget.style.boxShadow = "none";
//       e.currentTarget.style.borderColor = "#1e293b";
//       e.currentTarget.style.background = "rgba(30,41,59,0.7)";
//     }}
//   >
//     <i className={item.icon} />
//   </a>
// ))}

//     </div>
//   </ModalBody>

//   <ModalFooter style={{
//     background: "#111827",
//     borderTop: "1px solid #1e293b",
//     borderRadius: "0 0 18px 18px",
//     justifyContent: "center",
//     padding: "0.875rem 1.5rem",
//   }}>
//     <button
//       onClick={toggleHelpModal}
//       style={{
//         background: "#1e293b",
//         border: "1px solid #334155",
//         borderRadius: "9px",
//         color: "#94a3b8",
//         padding: "8px 28px",
//         fontSize: "0.875rem",
//         cursor: "pointer",
//         transition: "all 0.2s ease",
//       }}
//       onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "#334155"; }}
//       onMouseLeave={e => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "#1e293b"; }}
//     >
//       Close
//     </button>
//   </ModalFooter>
// </Modal>



//     </>
//   );
// }

// export default DemoNavbar;



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
//   Modal,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   Button,
// } from "reactstrap";

// import { adminRoutes, customerRoutes } from "routes.js";
// import { setCurrency } from "store/currencySlice";
// import { signOut } from "aws-amplify/auth";
// import LanguageSelector from "components/Languageselector/LanguageSelector";

// function DemoNavbar(props) {
//   const location = useLocation();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const [isOpen, setIsOpen] = React.useState(false);
//   const [dropdownOpen, setDropdownOpen] = React.useState(false);
//   const [accountDropdownOpen, setAccountDropdownOpen] = React.useState(false);
//   const [helpModalOpen, setHelpModalOpen] = React.useState(false);

//   const [color, setColor] = React.useState("transparent");
//   const sidebarToggle = React.useRef();

//   const currencies = ["USD", "EUR", "GBP", "INR", "JPY"];

//   const handleCurrencyChange = (event) => {
//     const selectedCurrency = event.target.value;
//     dispatch(setCurrency(selectedCurrency));
//   };

//   const toggle = () => {
//     if (isOpen) {
//       setColor("transparent");
//     } else {
//       setColor("white");
//     }
//     setIsOpen(!isOpen);
//   };

//   const dropdownToggle = () => setDropdownOpen(!dropdownOpen);
//   const accountDropdownToggle = () => setAccountDropdownOpen(!accountDropdownOpen);

//   const toggleHelpModal = () => setHelpModalOpen(!helpModalOpen);

//   const socialLinks = [
//     { href: "https://www.facebook.com/profile.php?id=61579534023491", icon: "fab fa-facebook", color: "#1877F2", glow: "rgba(24,119,242,0.35)" },
//     { href: "https://www.tiktok.com/@mesob85?_t=ZT-8yzttOuwr1r&_r=1", icon: "fab fa-tiktok", color: "#ffffff", glow: "rgba(255,255,255,0.15)" },
//     { href: "https://www.instagram.com/mesobfinancial?igsh=eWNoNWNoaG45cHI0", icon: "fab fa-instagram", color: "#E4405F", glow: "rgba(228,64,95,0.35)" },
//   ];

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
//     allRoutes.forEach((prop) => {
//       if (prop.path === location.pathname) {
//         name = prop.name;
//       }
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
//     return () => window.removeEventListener("resize", updateColor);
//   }, [isOpen]);

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
//     <>
//       <Navbar
//         color={
//           location.pathname.indexOf("full-screen-maps") !== -1 ? "white" : color
//         }
//         expand="lg"
//         className={
//           location.pathname.indexOf("full-screen-maps") !== -1
//             ? "navbar-absolute fixed-top"
//             : "navbar-absolute fixed-top " +
//             (color === "transparent" ? "navbar-transparent " : "")
//         }
//       >
//         <Container fluid>
//           <div className="navbar-wrapper">
//             <div className="navbar-toggle">
//               <button
//                 type="button"
//                 ref={sidebarToggle}
//                 className={`navbar-toggler ${isOpen ? "open" : ""}`}
//                 onClick={openSidebar}
//                 style={{
//                   border: "none",
//                   background: "transparent",
//                   padding: "10px",
//                   cursor: "pointer",
//                   display: "flex",
//                   flexDirection: "column",
//                   justifyContent: "center",
//                   gap: "5px",
//                 }}
//               >
//                 <span
//                   className="navbar-toggler-bar bar1"
//                   style={{
//                     display: "block",
//                     width: "30px",
//                     height: "4px",
//                     backgroundColor: "white",
//                     margin: "6px 0",
//                     transition: "0.3s ease-in-out",
//                     transform: isOpen ? "translateY(8px) rotate(45deg)" : "none",
//                   }}
//                 />
//                 <span
//                   className="navbar-toggler-bar bar2"
//                   style={{
//                     display: isOpen ? "none" : "block",
//                     width: "30px",
//                     height: "4px",
//                     backgroundColor: "white",
//                     margin: "6px 0",
//                     transition: "0.3s ease-in-out",
//                   }}
//                 />
//                 <span
//                   className="navbar-toggler-bar bar3"
//                   style={{
//                     display: "block",
//                     width: "30px",
//                     height: "4px",
//                     backgroundColor: "white",
//                     margin: "6px 0",
//                     transition: "0.3s ease-in-out",
//                     transform: isOpen
//                       ? "translateY(-8px) rotate(-45deg)"
//                       : "none",
//                   }}
//                 />
//               </button>
//             </div>

//             <NavbarBrand href="/">{getBrand()}</NavbarBrand>
//           </div>

//           {/* ── CENTERED SECTION: Language Selector ── */}
//           <div
//             style={{
//               position: "absolute",
//               left: "50%",
//               transform: "translateX(-50%)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <LanguageSelector />
//           </div>

//           {/* ── RIGHT SIDE NAV: Account & Help ── */}
//           <Nav navbar style={{ marginLeft: "auto" }}>
//             <Dropdown
//               nav
//               isOpen={accountDropdownOpen}
//               toggle={accountDropdownToggle}
//               className="account-dropdown"
//             >
//               <DropdownToggle caret nav>
//                 <i className="now-ui-icons users_single-02" />
//               </DropdownToggle>
//               <DropdownMenu right style={{ backgroundColor: "white" }}>
//                 {/* Help & Support Item */}
//                 <DropdownItem onClick={toggleHelpModal}>
//                   <i className="now-ui-icons ui-2_settings-90 mr-2" />
//                   Help & Support
//                 </DropdownItem>

//                 <DropdownItem divider />

//                 <DropdownItem onClick={handleLogout}>
//                   <i className="now-ui-icons ui-1_simple-remove mr-2" />
//                   Logout
//                 </DropdownItem>
//               </DropdownMenu>
//             </Dropdown>
//           </Nav>
//         </Container>
//       </Navbar>

//       {/* ==================== HELP & SUPPORT MODAL ==================== */}
//       <Modal
//         isOpen={helpModalOpen}
//         toggle={toggleHelpModal}
//         centered
//         modalClassName="dark-modal"
//         contentClassName="bg-transparent border-0 shadow-none"
//       >
//         <ModalHeader
//           toggle={toggleHelpModal}
//           style={{
//             background: "#111827",
//             borderBottom: "1px solid #1e293b",
//             borderRadius: "18px 18px 0 0",
//             padding: "1.1rem 1.5rem",
//           }}
//         >
//           <span style={{ color: "#ffffff", fontWeight: 700, fontSize: "1.1rem" }}>
//             Help & Support
//           </span>
//         </ModalHeader>

//         <ModalBody style={{ background: "#0d1117", padding: "2rem 1.75rem" }}>
//           <p
//             style={{
//               color: "#64748b",
//               textAlign: "center",
//               marginBottom: "2rem",
//               fontSize: "0.9rem",
//             }}
//           >
//             We're here to help! Reach out via any method below.
//           </p>

//           {/* Contact Cards */}
//           <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.75rem" }}>
//             {/* Phone */}
//             <a href="tel:+16149665005" style={{ textDecoration: "none" }}>
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "1rem",
//                   background: "rgba(30,41,59,0.6)",
//                   border: "1px solid rgba(59,130,246,0.15)",
//                   borderRadius: "12px",
//                   padding: "1rem 1.25rem",
//                   transition: "all 0.25s ease",
//                   cursor: "pointer",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.border = "1px solid rgba(59,130,246,0.45)";
//                   e.currentTarget.style.background = "rgba(59,130,246,0.08)";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.border = "1px solid rgba(59,130,246,0.15)";
//                   e.currentTarget.style.background = "rgba(30,41,59,0.6)";
//                 }}
//               >
//                 <div
//                   style={{
//                     width: "44px",
//                     height: "44px",
//                     flexShrink: 0,
//                     background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
//                     borderRadius: "12px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
//                   }}
//                 >
//                   <i className="now-ui-icons tech_mobile" style={{ color: "#fff", fontSize: "18px" }} />
//                 </div>
//                 <div>
//                   <p style={{ color: "#94a3b8", fontSize: "0.72rem", margin: 0, letterSpacing: "0.06em", textTransform: "uppercase" }}>
//                     Phone
//                   </p>
//                   <p style={{ color: "#e2e8f0", fontWeight: 600, margin: 0, fontSize: "0.95rem" }}>
//                     +1 (614) 966-5005
//                   </p>
//                 </div>
//               </div>
//             </a>

//             {/* Email */}
//             <a href="mailto:info@mesobfinancial.com" style={{ textDecoration: "none" }}>
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "1rem",
//                   background: "rgba(30,41,59,0.6)",
//                   border: "1px solid rgba(99,102,241,0.15)",
//                   borderRadius: "12px",
//                   padding: "1rem 1.25rem",
//                   transition: "all 0.25s ease",
//                   cursor: "pointer",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.border = "1px solid rgba(99,102,241,0.45)";
//                   e.currentTarget.style.background = "rgba(99,102,241,0.08)";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.border = "1px solid rgba(99,102,241,0.15)";
//                   e.currentTarget.style.background = "rgba(30,41,59,0.6)";
//                 }}
//               >
//                 <div
//                   style={{
//                     width: "44px",
//                     height: "44px",
//                     flexShrink: 0,
//                     background: "linear-gradient(135deg,#6366f1,#4338ca)",
//                     borderRadius: "12px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
//                   }}
//                 >
//                   <i className="now-ui-icons ui-1_email-85" style={{ color: "#fff", fontSize: "18px" }} />
//                 </div>
//                 <div>
//                   <p style={{ color: "#94a3b8", fontSize: "0.72rem", margin: 0, letterSpacing: "0.06em", textTransform: "uppercase" }}>
//                     Email
//                   </p>
//                   <p style={{ color: "#e2e8f0", fontWeight: 600, margin: 0, fontSize: "0.95rem" }}>
//                     info@mesobfinancial.com
//                   </p>
//                 </div>
//               </div>
//             </a>
//           </div>

//           {/* Divider */}
//           <div style={{ borderTop: "1px solid #1e293b", marginBottom: "1.5rem" }} />

//           {/* Social */}
//           <p
//             style={{
//               color: "#64748b",
//               fontSize: "0.75rem",
//               textAlign: "center",
//               textTransform: "uppercase",
//               letterSpacing: "0.08em",
//               marginBottom: "1rem",
//             }}
//           >
//             Follow us on
//           </p>

//           <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
//             {socialLinks.map((item) => (
//               <a
//                 key={item.href}
//                 href={item.href}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 style={{
//                   width: "46px",
//                   height: "46px",
//                   background: "rgba(30,41,59,0.7)",
//                   border: "1px solid #1e293b",
//                   borderRadius: "12px",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   color: item.color,
//                   fontSize: "20px",
//                   transition: "all 0.25s ease",
//                   textDecoration: "none",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.boxShadow = `0 4px 16px ${item.glow}`;
//                   e.currentTarget.style.borderColor = item.color;
//                   e.currentTarget.style.background = "rgba(30,41,59,1)";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.boxShadow = "none";
//                   e.currentTarget.style.borderColor = "#1e293b";
//                   e.currentTarget.style.background = "rgba(30,41,59,0.7)";
//                 }}
//               >
//                 <i className={item.icon} />
//               </a>
//             ))}
//           </div>
//         </ModalBody>

//         <ModalFooter
//           style={{
//             background: "#111827",
//             borderTop: "1px solid #1e293b",
//             borderRadius: "0 0 18px 18px",
//             justifyContent: "center",
//             padding: "0.875rem 1.5rem",
//           }}
//         >
//           <button
//             onClick={toggleHelpModal}
//             style={{
//               background: "#1e293b",
//               border: "1px solid #334155",
//               borderRadius: "9px",
//               color: "#94a3b8",
//               padding: "8px 28px",
//               fontSize: "0.875rem",
//               cursor: "pointer",
//               transition: "all 0.2s ease",
//             }}
//             onMouseEnter={(e) => {
//               e.currentTarget.style.color = "#fff";
//               e.currentTarget.style.background = "#334155";
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.color = "#94a3b8";
//               e.currentTarget.style.background = "#1e293b";
//             }}
//           >
//             Close
//           </button>
//         </ModalFooter>
//       </Modal>
//     </>
//   );
// }

// export default DemoNavbar;

import React, { useState, useEffect } from "react";
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
import axios from "axios";

import { adminRoutes, customerRoutes } from "routes.js";
import { setCurrency } from "store/currencySlice";
import { signOut } from "aws-amplify/auth";
import LanguageSelector from "components/Languageselector/LanguageSelector";

function DemoNavbar(props) {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [companyName, setCompanyName] = useState("");
  const [loadingCompanyName, setLoadingCompanyName] = useState(false);

  const [color, setColor] = useState("transparent");
  const sidebarToggle = React.useRef();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch company name when on dashboard or financial-report pages
  useEffect(() => {
    const isRelevantPage =
      location.pathname.includes("/dashboard") ||
      location.pathname.includes("/financial-report");

    if (isRelevantPage) {
      fetchCompanyName();
    }
  }, [location.pathname]);

  const fetchCompanyName = async () => {
    setLoadingCompanyName(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const response = await axios.get(
        `https://iaqwrjhk4f.execute-api.us-east-1.amazonaws.com/dev/MesobFinancialSystem/Users/${userId}`
      );
      setCompanyName(response.data?.user?.companyName || "");
    } catch (error) {
      console.error("Error fetching company name:", error);
      setCompanyName("");
    } finally {
      setLoadingCompanyName(false);
    }
  };

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

  const toggleHelpModal = () => setHelpModalOpen(!helpModalOpen);

  const socialLinks = [
    { href: "https://www.facebook.com/profile.php?id=61579534023491", icon: "fab fa-facebook", color: "#1877F2", glow: "rgba(24,119,242,0.35)" },
    { href: "https://www.tiktok.com/@mesob85?_t=ZT-8yzttOuwr1r&_r=1", icon: "fab fa-tiktok", color: "#ffffff", glow: "rgba(255,255,255,0.15)" },
    { href: "https://www.instagram.com/mesobfinancial?igsh=eWNoNWNoaG45cHI0", icon: "fab fa-instagram", color: "#E4405F", glow: "rgba(228,64,95,0.35)" },
  ];

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

  useEffect(() => {
    window.addEventListener("resize", updateColor);
    return () => window.removeEventListener("resize", updateColor);
  }, [isOpen]);

  useEffect(() => {
    if (
      window.innerWidth < 993 &&
      document.documentElement.className.indexOf("nav-open") !== -1
    ) {
      document.documentElement.classList.toggle("nav-open");
      sidebarToggle.current.classList.toggle("toggled");
    }
  }, [location]);

  // Check if should show company name
  const showCompanyName =
    location.pathname.includes("/dashboard") ||
    location.pathname.includes("/financial-report");

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
        <Container fluid style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* LEFT: Hamburger + Language Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            {/* Hamburger Menu */}
            <div className="navbar-toggle">
              <button
                type="button"
                ref={sidebarToggle}
                className={`navbar-toggler ${isOpen ? "open" : ""}`}
                onClick={openSidebar}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: "8px",
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
                    width: "28px",
                    height: "3px",
                    backgroundColor: "white",
                    margin: "4px 0",
                    transition: "0.3s ease-in-out",
                    transform: isOpen ? "translateY(8px) rotate(45deg)" : "none",
                  }}
                />
                <span
                  className="navbar-toggler-bar bar2"
                  style={{
                    display: isOpen ? "none" : "block",
                    width: "28px",
                    height: "3px",
                    backgroundColor: "white",
                    margin: "4px 0",
                    transition: "0.3s ease-in-out",
                  }}
                />
                <span
                  className="navbar-toggler-bar bar3"
                  style={{
                    display: "block",
                    width: "28px",
                    height: "3px",
                    backgroundColor: "white",
                    margin: "4px 0",
                    transition: "0.3s ease-in-out",
                    transform: isOpen
                      ? "translateY(-8px) rotate(-45deg)"
                      : "none",
                  }}
                />
              </button>
            </div>

            {/* Language Selector - Next to menu icon (hidden on profile page) */}
           <div style={{marginLeft:15}}>
             {!location.pathname.includes("/profile") && <LanguageSelector />}
           </div>


            {/* Brand - Hidden on mobile, shown on desktop */}
            {!isMobile && (
              <NavbarBrand href="/" style={{ marginLeft: "1.5rem" }}>
                {getBrand()}
              </NavbarBrand>
            )}
          </div>

          {/* CENTER: Company Name (only on Dashboard & Financial Report) */}
          {showCompanyName && companyName && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  color: "#ffffff",
                  margin: 0,
                  fontSize: "clamp(12px, 3vw, 18px)",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  maxWidth: "200px",
                }}
              >
                {companyName}
              </h3>
            </div>
          )}

          {/* RIGHT: Account & Help */}
          <Nav navbar style={{ display: "flex", alignItems: "center" }}>
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
                {/* Help & Support Item */}
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
      <Modal
        isOpen={helpModalOpen}
        toggle={toggleHelpModal}
        centered
        modalClassName="dark-modal"
        contentClassName="bg-transparent border-0 shadow-none"
      >
        <ModalHeader
          toggle={toggleHelpModal}
          style={{
            background: "#111827",
            borderBottom: "1px solid #1e293b",
            borderRadius: "18px 18px 0 0",
            padding: "1.1rem 1.5rem",
          }}
        >
          <span style={{ color: "#ffffff", fontWeight: 700, fontSize: "1.1rem" }}>
            Help & Support
          </span>
        </ModalHeader>

        <ModalBody style={{ background: "#0d1117", padding: "2rem 1.75rem" }}>
          <p
            style={{
              color: "#64748b",
              textAlign: "center",
              marginBottom: "2rem",
              fontSize: "0.9rem",
            }}
          >
            We're here to help! Reach out via any method below.
          </p>

          {/* Contact Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.75rem" }}>
            {/* Phone */}
            <a href="tel:+16149665005" style={{ textDecoration: "none" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  background: "rgba(30,41,59,0.6)",
                  border: "1px solid rgba(59,130,246,0.15)",
                  borderRadius: "12px",
                  padding: "1rem 1.25rem",
                  transition: "all 0.25s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(59,130,246,0.45)";
                  e.currentTarget.style.background = "rgba(59,130,246,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(59,130,246,0.15)";
                  e.currentTarget.style.background = "rgba(30,41,59,0.6)";
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    flexShrink: 0,
                    background: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
                  }}
                >
                  <i className="now-ui-icons tech_mobile" style={{ color: "#fff", fontSize: "18px" }} />
                </div>
                <div>
                  <p style={{ color: "#94a3b8", fontSize: "0.72rem", margin: 0, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Phone
                  </p>
                  <p style={{ color: "#e2e8f0", fontWeight: 600, margin: 0, fontSize: "0.95rem" }}>
                    +1 (614) 966-5005
                  </p>
                </div>
              </div>
            </a>

            {/* Email */}
            <a href="mailto:info@mesobfinancial.com" style={{ textDecoration: "none" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  background: "rgba(30,41,59,0.6)",
                  border: "1px solid rgba(99,102,241,0.15)",
                  borderRadius: "12px",
                  padding: "1rem 1.25rem",
                  transition: "all 0.25s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(99,102,241,0.45)";
                  e.currentTarget.style.background = "rgba(99,102,241,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(99,102,241,0.15)";
                  e.currentTarget.style.background = "rgba(30,41,59,0.6)";
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    flexShrink: 0,
                    background: "linear-gradient(135deg,#6366f1,#4338ca)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
                  }}
                >
                  <i className="now-ui-icons ui-1_email-85" style={{ color: "#fff", fontSize: "18px" }} />
                </div>
                <div>
                  <p style={{ color: "#94a3b8", fontSize: "0.72rem", margin: 0, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Email
                  </p>
                  <p style={{ color: "#e2e8f0", fontWeight: 600, margin: 0, fontSize: "0.95rem" }}>
                    info@mesobfinancial.com
                  </p>
                </div>
              </div>
            </a>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid #1e293b", marginBottom: "1.5rem" }} />

          {/* Social */}
          <p
            style={{
              color: "#64748b",
              fontSize: "0.75rem",
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "1rem",
            }}
          >
            Follow us on
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
            {socialLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: "46px",
                  height: "46px",
                  background: "rgba(30,41,59,0.7)",
                  border: "1px solid #1e293b",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: item.color,
                  fontSize: "20px",
                  transition: "all 0.25s ease",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 4px 16px ${item.glow}`;
                  e.currentTarget.style.borderColor = item.color;
                  e.currentTarget.style.background = "rgba(30,41,59,1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "#1e293b";
                  e.currentTarget.style.background = "rgba(30,41,59,0.7)";
                }}
              >
                <i className={item.icon} />
              </a>
            ))}
          </div>
        </ModalBody>

        <ModalFooter
          style={{
            background: "#111827",
            borderTop: "1px solid #1e293b",
            borderRadius: "0 0 18px 18px",
            justifyContent: "center",
            padding: "0.875rem 1.5rem",
          }}
        >
          <button
            onClick={toggleHelpModal}
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "9px",
              color: "#94a3b8",
              padding: "8px 28px",
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.background = "#334155";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#94a3b8";
              e.currentTarget.style.background = "#1e293b";
            }}
          >
            Close
          </button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export default DemoNavbar;