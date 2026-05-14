import React from "react";
import "../css/navbar.css";

const Footer = () => {
  return (
    <footer className="footer no-print">
      <p>
        &copy; {new Date().getFullYear()} Imagine Entertainment. All Rights
        Reserved.
      </p>
    </footer>
  );
};

export default Footer;
