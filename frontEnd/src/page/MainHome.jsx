// import React from "react";
// import { useNavigate } from "react-router-dom";
// import "../css/login.css";
// import "../css/home.css";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";

// export default function MainHome() {
//   const navigate = useNavigate();
//   return (
//     <>
//       <div className="bodyContainer">
//         <Navbar />
//         <div className="main-home-container">
//           <h1 className="home-title">Dashboard Overview</h1>

//           <div className="box-wrapper highlight">
//             {/* Box 1 */}
//             <div
//               className="info-box highlight1"
//               onClick={() => {
//                 navigate("/");
//               }}
//             >
//               <h3>Password & User Name </h3>
//               <p className="box-count">120</p>
//               <span className="box-desc">All saved login details</span>
//             </div>

//             {/* Box 2 */}
//             <div
//               className="info-box highlight"
//               onClick={() => {
//                 navigate("/pc");
//               }}
//             >
//               <h3> Destop Pc Details</h3>
//               <p className="box-count">05</p>
//               <span className="box-desc">Modified in last 24h</span>
//             </div>

//             {/* Box 3 */}
//             <div className="info-box highlight2">
//               <h3>LapTop Details</h3>
//               <p className="box-count">02</p>
//               <span className="box-desc">Active administrators</span>
//             </div>
//           </div>
//         </div>
//       </div>
//       <Footer />
//     </>
//   );
// }
