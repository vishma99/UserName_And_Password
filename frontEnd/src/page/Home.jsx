import { useState, useEffect } from "react";
import "../css/login.css";
import axios from "axios";

export default function Home() {
  const [cards, setCards] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [tempData, setTempData] = useState({
    header: "",
    username: "",
    password: "",
    remark: "",
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const API_URL = `${API_BASE_URL}/cards`;
  const currentDateTime = new Date().toLocaleString();

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await axios.get(API_URL);
      setCards(res.data.map((c) => ({ ...c, id: c._id })));
    } catch (err) {
      console.error("Error fetching cards:", err);
    }
  };

  const handleTempChange = (e) => {
    const { name, value } = e.target;
    setTempData({ ...tempData, [name]: value });
  };

  const openEditModal = (card) => {
    setEditingId(card.id);
    setTempData({
      header: card.header,
      username: card.username,
      password: card.password,
      remark: card.remark,
    });
    setIsModalOpen(true);
  };

  const saveCard = async () => {
    if (tempData.header && tempData.username) {
      try {
        if (editingId) {
          await axios.put(`${API_URL}/${editingId}`, tempData);
        } else {
          await axios.post(API_URL, tempData);
        }
        fetchCards();
        closeModal();
      } catch (err) {
        alert("Database connection error.");
      }
    } else {
      alert("Please enter all details.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setTempData({ header: "", username: "", password: "", remark: "" });
  };

  const handlePrint = () => {
    if (cards.length === 0) return alert("Enter the Data.");
    window.print();
  };

  return (
    <div className="home-container">
      {/* -----------------------------------------------------------
          1. WEB INTERFACE (වෙබ් පිටුවට පමණයි - No Print)
      ----------------------------------------------------------- */}
      <div
        className="no-print web-interface"
        style={{
          padding: "30px",
          background: "#0f1011",
          minHeight: "100vh",
          color: "#e0e0e0",
        }}
      >
        {/* Buttons Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            marginTop: "80px",
            marginBottom: "40px",
          }}
        >
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              width: "auto",
              background: "#007bff",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            + ADD NEW CARD
          </button>
          <button
            onClick={handlePrint}
            style={{
              width: "auto",
              background: "#28a745",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            DOWNLOAD / PRINT ALL
          </button>
        </div>

        {/* Modal Popup */}
        {isModalOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.8)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              className="login-container"
              style={{
                width: "400px",
                background: "#1e2124",
                padding: "30px",
                borderRadius: "15px",
                border: "1px solid #333",
                color: "#fff",
              }}
            >
              <h3>{editingId ? "Update Data" : "Enter New Data"}</h3>
              <div style={{ marginBottom: "15px", textAlign: "left" }}>
                <label>Header:</label>
                <input
                  type="text"
                  name="header"
                  value={tempData.header}
                  onChange={handleTempChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #444",
                    background: "#2b2f33",
                    color: "#fff",
                  }}
                />
              </div>
              <div style={{ marginBottom: "15px", textAlign: "left" }}>
                <label>Username:</label>
                <input
                  type="text"
                  name="username"
                  value={tempData.username}
                  onChange={handleTempChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #444",
                    background: "#2b2f33",
                    color: "#fff",
                  }}
                />
              </div>
              <div style={{ marginBottom: "15px", textAlign: "left" }}>
                <label>Password:</label>
                <input
                  type="text"
                  name="password"
                  value={tempData.password}
                  onChange={handleTempChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #444",
                    background: "#2b2f33",
                    color: "#fff",
                  }}
                />
              </div>
              <div style={{ marginBottom: "15px", textAlign: "left" }}>
                <label>Remark:</label>
                <input
                  type="text"
                  name="remark"
                  value={tempData.remark}
                  onChange={handleTempChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #444",
                    background: "#2b2f33",
                    color: "#fff",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button
                  onClick={saveCard}
                  style={{
                    background: "#28a745",
                    flex: 1,
                    padding: "10px",
                    border: "none",
                    borderRadius: "5px",
                    color: "#fff",
                  }}
                >
                  {editingId ? "Update" : "Save"}
                </button>
                <button
                  onClick={closeModal}
                  style={{
                    background: "#dc3545",
                    flex: 1,
                    padding: "10px",
                    border: "none",
                    borderRadius: "5px",
                    color: "#fff",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Web Display Grid (Scroll logic) */}
        <div className="web-grid-scroll">
          {cards.length === 0 ? (
            <p style={{ textAlign: "center" }}>Data not yet collected..</p>
          ) : (
            cards.map((card) => (
              <div
                key={card.id}
                className="responsive-card-item"
                onClick={() => openEditModal(card)}
              >
                <h2 className="web-card-header">{card.header}</h2>
                <div className="web-card-body">
                  <p>
                    <strong>Username:</strong> <span>{card.username}</span>
                  </p>
                  <p>
                    <strong>Password:</strong> <span>{card.password}</span>
                  </p>
                  {card.remark && (
                    <p className="web-remark">
                      <strong>Remark:</strong> {card.remark}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* -----------------------------------------------------------
          2. PDF / PRINT VIEW (PDF එකට පමණයි)
      ----------------------------------------------------------- */}
      <div className="pdf-print-view">
        <div className="print-border-frame"></div>

        <div className="print-only-wrapper">
          <p className="print-date-align">Date & Time: {currentDateTime}</p>
          <h1
            style={{
              textAlign: "center",
              textDecoration: "underline",
              paddingTop: "25px",
              margin: "0",
            }}
          >
            Password and User Name
          </h1>
        </div>

        <div className="cards-grid">
          {cards.map((card, index) => (
            <div key={card.id} className="card-item">
              <h2 className="card-header-style">
                <span className="print-index">{index + 1}. </span>
                {card.header}
              </h2>
              <div className="card-body-style">
                <span className="print-line">
                  <strong>username</strong> {card.username}
                </span>
                <span className="print-password">
                  <strong>password</strong> {card.password}
                </span>
                {card.remark && (
                  <span className="print-remark">
                    <strong>remark</strong> {card.remark}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`

      .web-grid-scroll {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 15px;
        max-width: 1400px;
        margin: 0 auto;
        max-height: 70vh; /* තිරයේ උස අනුව scroll වීම */
        overflow-y: auto;
        padding: 10px;
      }

      /* Mobile (කුඩා තිර සඳහා) - පේළියකට 1 බැගින් */
      .responsive-card-item {
        width: 100%;
        min-width: 250px;
        border-left: 5px solid #007bff;
        padding: 15px;
        background: #1e2124;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        cursor: pointer;
        border: 1px solid #333;
        box-sizing: border-box;
      }

      .responsive-btn {
        background: #007bff; color: #fff; border: none; padding: 12px 20px;
        border-radius: 8px; cursor: pointer; font-weight: bold; text-transform: uppercase;
      }
      .print-btn { background: #28a745; }

      .web-card-header { font-size: 1.1rem; border-bottom: 1px solid #333; padding-bottom: 10px; color: #007bff; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .web-card-body { marginTop: 10px; font-size: 0.9rem; color: #bbb; }
      .web-card-body span { color: #eee; }
      .web-remark { color: #f39c12 !important; }

      /* 💻 Tablets (මධ්‍යම තිර සඳහා) - පේළියකට 2 බැගින් */
      @media (min-width: 600px) {
        .responsive-card-item { width: calc(50% - 15px); }
      }

      /* 🖥️ Desktop (විශාල තිර සඳහා) - පේළියකට 4 බැගින් */
      @media (min-width: 1024px) {
        .responsive-card-item { width: calc(25% - 15px); }
        .web-grid-scroll { gap: 20px; }
      }
        /* Web එකේදී PDF View එක සඟවන්න */
        .pdf-print-view { display: none; }

        @media print {
          /* Web කොටස් සඟවන්න */
          .no-print { display: none !important; }

          /* PDF View එක පෙන්වන්න */
          .pdf-print-view { display: block !important; }

          html, body {
            height: auto;
            overflow: visible;
            margin: 0;
            padding: 0;
            background: #fff !important;
            color: #000 !important;
          }

          @page {
            margin: 0mm; 
            size: A4;
          }

          .print-border-frame {
            display: block;
            position: fixed;
            top: 5mm;
            left: 5mm;
            right: 5mm;
            bottom: 5mm;
            border: 1.5px solid #000;
            z-index: 9999;
            pointer-events: none;
          }

          .print-only-wrapper { display: block !important; margin: 5mm 8mm 0 8mm; }
          .print-date-align { text-align: right; font-size: 10px; margin: 5px; margin-left: 600px; }
          
          /* 🟢 Cards Grid එක වම් පසටම පෙළගැස්වීම */
          .cards-grid { 
            display: block !important; 
            position: absolute !important;
            left: 8mm !important; 
            top: 45mm !important; 
            margin: 0 !important;
            padding: 0 !important;
            width: calc(100% - 16mm) !important;
            text-align: left !important;
          }

          .card-item {
            width: 98% !important;
            border: none !important;
            border-bottom: 1px dashed #ccc !important;
            margin-bottom: 8px !important;
            padding: 7px !important;
            page-break-inside: avoid;
            text-align: left !important;
          }

          .card-header-style { 
            font-size: 18px !important; 
            font-weight: bold !important; 
            margin: 15px 0!important; 
            padding: 10px o!important;
            text-align: left !important; 
            color: #333 !important;
          }
          
          .print-index { display: inline !important; 
          color: #333 !important;}

          .card-body-style {
            padding: 5px !important;
            margin-top: 2px !important;
          }

          .print-line { 
            display: inline !important; 
            margin-right: 15px !important; 
            padding: 0 !important;
            text-align: left !important; 
            color: #6b6868 !important;

          }
          .print-line strong { text-transform: lowercase; }
          .print-line strong::after { content: " = "; }

          .print-password { 
            display: inline !important; 
            margin-right: 15px !important; 
            padding: 0 !important;
            text-align: center !important; 
            color: #6b6868 !important;
          }
          .print-password strong { text-transform: lowercase; }
          .print-password strong::after { content: " = "; }

          .print-remark { 
            display: block !important; 
            color: red !important;
            font-weight: bold !important;
            font-size: 12px !important;
            text-align: right !important;
            float: right;
          }
          .print-remark strong { display: none; }
          .print-remark::before { content: "* "; font-weight: bold; }
        }
      `}</style>
    </div>
  );
}
