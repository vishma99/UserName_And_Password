import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/pc.css";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const Laptop = () => {
  // 1. State for the list of items
  const [items, setItems] = useState([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  // 2. State for Modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [selectedlaptopId, setSelectedlaptopId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();

  // 3. State for form data
  const [formData, setFormData] = useState({
    username: "",
    laptopPrefix: "IE/LAPTOP/laptop/",
    laptopNumber: "",
    date: "",
    section: "",

    location: "",
    description: "",
    Model: "",
    SerialNumber: "",
    Processor: "",
    Ram: "",
    Storage: "",
    Other: "",

    Remark: "",
  });
  const handleLogout = () => {
    // මෙහිදී ඔබගේ ලොගින් දත්ත (Token/LocalStorage) ඉවත් කරන්න
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };
  useEffect(() => {
    const handleVisibilityChange = () => {
      // පරිශීලකයා වෙනත් Tab එකකට ගියහොත් හෝ Browser එක Minimize කළහොත්
      if (document.visibilityState === "hidden") {
        console.log("User left the tab. Logging out...");
        handleLogout(); // ඔබ කලින් සෑදූ Logout function එක මෙතැනදී කැඳවනු ලැබේ
      }
    };

    // Event listener එක එක් කිරීම
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Component එකෙන් ඉවත් වන විට listener එක ඉවත් කිරීම (Cleanup)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [navigate]);
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type == "file") {
      const file = files[0];
      if (file) {
        setFormData({ ...formData, photo: URL.createObjectURL(file) });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle Form Submission
  // Handle Form Submission
  useEffect(() => {
    const fetchlaptops = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/laptops/all`);
        setItems(res.data);
      } catch (err) {
        console.log("Error fetching data");
      }
    };
    fetchlaptops();
  }, []);
  const handleEdit = (item) => {
    if (!item) return;

    setEditingId(item._id); // MongoDB ID එක තබා ගැනීමට

    // 🟢 මෙහිදී laptopId එක කැබලි වලට කඩන්නේ නැතිව සම්පූර්ණ අගය ලබා දෙන්න
    setFormData({
      ...item,
      laptopPrefix: "", // laptop ID වෙනස් නොකරන නිසා මේවා හිස්ව තැබිය හැක
      laptopNumber: item.laptopId, // පරණ laptop ID එකම පෙන්වීමට
    });

    setIsModalOpen(true);
  };
  const handleNext = (e) => {
    e.preventDefault();
    setIsModalOpen(false); // පළමු Modal එක වසන්න
    setIsSuccessModalOpen(true); // දෙවන Modal එක අරින්න
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const today = new Date().toISOString().split("T")[0];
    const fulllaptopId = `${formData.laptopPrefix}${formData.laptopNumber.padStart(3, "0")}`;

    let finalDataToSave = { ...formData, laptopId: fulllaptopId };

    // 🛠️ Edit කරන විට පරණ දත්ත වලට යටින් අලුත් දත්ත එකතු කිරීම
    if (editingId) {
      const originalItem = items.find((item) => item._id === editingId);

      if (originalItem) {
        const updatedFields = {};

        const hardwareFields = [
          "Model",
          "SerialNumber",
          "Processor",
          "Ram",
          "Storage",
          "Other",

          "Remark",
        ];

        hardwareFields.forEach((field) => {
          // Form එකේ දැනට තියෙන අගය, database එකේ තිබුණ පරණ අගයට වඩා වෙනස් නම් පමණක්
          if (formData[field] !== originalItem[field]) {
            const oldValue = originalItem[field] || ""; // පරණ අගය
            const newValue = formData[field]; // ඔබ දැන් ටයිප් කළ අලුත් අගය

            // පැරණි අගය හිස් නැතිනම්, එයට යටින් අලුත් එක දිනය සහිතව එකතු කරයි
            if (oldValue.trim() !== "") {
              updatedFields[field] =
                `${oldValue}\n${newValue} (${today} update)`;
            } else {
              updatedFields[field] = newValue; // කලින් හිස්ව තිබුණා නම් කෙලින්ම අගය දායි
            }
          }
        });

        finalDataToSave = {
          ...formData,
          ...updatedFields,
          laptopId: fulllaptopId,
        };
      }
    }

    setLoading(true);
    try {
      let response;
      if (editingId) {
        response = await axios.put(
          `${API_BASE_URL}/laptops/update/${editingId}`,
          finalDataToSave,
        );
      } else {
        response = await axios.post(
          `${API_BASE_URL}/laptops/add`,
          finalDataToSave,
        );
      }

      if (response.data.success) {
        alert(response.data.message);
        setIsSuccessModalOpen(false);
        setEditingId(null);
        const res = await axios.get(`${API_BASE_URL}/laptops/all`);
        setItems(res.data);

        // Form Reset
        setFormData({
          username: "",
          laptopPrefix: "IE/LAPTOP/PC/",
          laptopNumber: "",
          date: "",
          section: "",
          location: "",
          description: "",
          Model: "",
          SerialNumber: "",
          Processor: "",
          Ram: "",
          Storage: "",
          Other: "",

          Remark: "",
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error saving data");
    } finally {
      setLoading(false);
    }
  };
  const openDeleteConfirm = (id) => {
    setSelectedlaptopId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmAndDelete = async () => {
    if (!deletePassword) return alert("Please enter password.");

    try {
      const userStr = localStorage.getItem("user");
      const loggedInUser = JSON.parse(userStr);
      const username = loggedInUser.username;

      // Backend එකට Request එක යැවීම
      const response = await axios.post(
        `${API_BASE_URL}/laptops/verify-and-delete/${selectedlaptopId}`,
        { username, password: deletePassword },
      );

      if (response.data.success) {
        alert("Deleted successfully!");
        // Table එක Refresh කිරීම
        const res = await axios.get(`${API_BASE_URL}/laptops/all`);
        setItems(res.data);
        closeDeleteModal();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting data.");
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletePassword("");
    setSelectedlaptopId(null);
  };
  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(18);
    doc.text("Desktop laptop Inventory Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    const tableColumn = [
      "Laltop ID",
      "Date",
      "User",
      "Model",
      "SerialNumber",
      "Processor",
      "Ram",
      "Storage",

      "Remark",
    ];

    const tableRows = items.map((item) => [
      item.laptopId,
      item.date,
      item.username,
      item.Model,
      item.SerialNumber,
      item.Processor,
      item.Ram,

      item.Storage,

      item.Remark,
    ]);

    // 🟢 මෙන්න මෙතැනයි වෙනස: doc.autoTable වෙනුවට autoTable(doc, ...) භාවිතා කරන්න
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      columnStyles: {
        3: {
          fillColor: [255, 255, 200], // ලා කහ පැහැය
          fontStyle: "bold",
        },
        4: { fillColor: [200, 255, 200] },
        5: { fillColor: [220, 240, 255] },
        6: { fillColor: [240, 220, 255] },
        7: { fillColor: [255, 220, 230] },
      },
    });

    doc.save(`laptop_Report_${Date.now()}.pdf`);
  };
  return (
    <>
      <div className="main1">
        <Navbar />
        <header className="mainHeader">
          <h1>Laptop Dashboard</h1>

          {/* බොත්තම් දෙක ළඟින් තැබීමට */}
          <button className="mainButton" onClick={() => setIsModalOpen(true)}>
            + Add Item
          </button>
          <button className="mainButton printButton" onClick={downloadPDF}>
            Print Report
          </button>
        </header>

        {/* ## Data Table */}
        {/* 🟢 Table එක scroll කිරීමට Wrapper එකක් එක් කරන්න */}
        <div className="table-container">
          <table className="mainTable">
            <thead>
              <tr>
                <th>laptop ID</th>
                <th>User Name</th>
                <th>Build Date</th>
                <th>Section</th>
                <th>Location</th>
                <th>Description</th>
                <th>Model</th>
                <th>Serial Number</th>
                <th>Processor</th>
                <th>Ram</th>
                <th>Storage</th>
                <th>Other</th>

                <th>Remark</th>
                <th>Edite</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  {/* ... ඔබගේ ඉතිරි කේතය ... */}
                  <td>{item.laptopId}</td>{" "}
                  {/* මෙහිදී fulllaptopId එක කෙලින්ම භාවිතා කළ හැක */}
                  <td>
                    {item.username.includes("update") ? (
                      <>
                        <div>{item.username.split(" (")[0]}</div>
                        <small style={{ color: "#ffc107", display: "block" }}>
                          ({item.username.split(" (")[1]}
                        </small>
                      </>
                    ) : (
                      item.username
                    )}
                  </td>
                  <td>
                    {item.date.includes("update") ? (
                      <>
                        <div>{item.date.split(" (")[0]}</div>
                        <small style={{ color: "#ffc107", display: "block" }}>
                          ({item.date.split(" (")[1]}
                        </small>
                      </>
                    ) : (
                      item.date
                    )}
                  </td>
                  <td>
                    {item.section.includes("update") ? (
                      <>
                        <div>{item.section.split(" (")[0]}</div>
                        <small style={{ color: "#ffc107", display: "block" }}>
                          ({item.section.split(" (")[1]}
                        </small>
                      </>
                    ) : (
                      item.section
                    )}
                  </td>
                  <td>
                    {item.location.includes("update") ? (
                      <>
                        <div>{item.location.split(" (")[0]}</div>
                        <small style={{ color: "#ffc107", display: "block" }}>
                          ({item.location.split(" (")[1]}
                        </small>
                      </>
                    ) : (
                      item.location
                    )}
                  </td>
                  <td>
                    {item.description.includes("update") ? (
                      <>
                        <div>{item.description.split(" (")[0]}</div>
                        <small style={{ color: "#ffc107", display: "block" }}>
                          ({item.description.split(" (")[1]}
                        </small>
                      </>
                    ) : (
                      item.description
                    )}
                  </td>
                  <td>
                    <div className="scroll-cell">{item.Model || "-"}</div>
                  </td>
                  <td>
                    <div className="scroll-cell">
                      {item.SerialNumber || "-"}
                    </div>
                  </td>
                  <td>
                    <div className="scroll-cell">{item.Processor || "-"}</div>
                  </td>
                  <td>
                    <div className="scroll-cell">{item.Ram || "-"}</div>
                  </td>
                  <td>
                    <div className="scroll-cell">{item.Storage || "-"}</div>
                  </td>
                  <td>
                    <div className="scroll-cell">{item.Other || "-"}</div>
                  </td>
                  <td>
                    <div className="scroll-cell">{item.Remark || "-"}</div>
                  </td>
                  <td>
                    {/* Edit logic here */}
                    <button
                      style={{
                        background: "#007bff",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleEdit(item)}
                    >
                      EDIT
                    </button>
                  </td>
                  <td>
                    <button
                      style={{
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => openDeleteConfirm(item._id)}
                    >
                      DELETE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ## Popup Modal */}
        {isModalOpen && (
          <div className="popMain">
            <div className="popMainContainer">
              <h2>Add Laptop Item</h2>
              <form onSubmit={handleNext}>
                <label>laptop ID</label>
                <div
                  style={{ display: "flex", gap: "5px", marginBottom: "15px" }}
                >
                  {/* 1. Dropdown කොටස */}
                  <select
                    className="inputStyle1"
                    name="laptopPrefix"
                    value={formData.laptopPrefix}
                    onChange={handleChange}
                    style={{
                      width: "140px",
                      marginBottom: "0",
                      cursor: "pointer",
                    }}
                    disabled={editingId !== null}
                  >
                    <option value="IE/LAPTOP/laptop/">IE/LAPTOP/laptop/</option>
                    {/* <option value="IE/LAPTOP/laptop/">IE/EVENT/LAPTOP/</option> */}
                  </select>

                  {/* 2. අංක 3 ටයිප් කරන කොටස */}
                  <input
                    className="inputStyle"
                    type="text"
                    name="laptopNumber"
                    placeholder="000"
                    maxLength="3" // 🟢 ඉලක්කම් 3කට සීමා කරයි
                    value={formData.laptopNumber}
                    onChange={(e) => {
                      // ඉලක්කම් පමණක් ටයිප් කිරීමට ඉඩ ලබා දීම
                      const val = e.target.value.replace(/\D/g, "");
                      setFormData({ ...formData, laptopNumber: val });
                    }}
                    disabled={editingId !== null}
                    style={{ marginBottom: "0" }}
                    required
                  />
                </div>

                <label>User Name</label>
                <input
                  className="inputStyle"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
                <label>Date</label>
                <input
                  className="inputStyle"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />

                <label>Section</label>
                <select
                  className="inputStyle1"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  required
                  style={{ cursor: "pointer" }}
                >
                  <option value="">Select Section</option>
                  <option value="management">Management</option>
                  <option value="grapic">Grapic</option>
                  <option value="marketing">Marketing</option>
                  <option value="account">Account</option>
                  <option value="stores">Stores</option>
                  <option value="led">LED</option>
                  <option value="light">Light</option>
                  <option value="laser">Laser</option>
                  <option value="sound">Sound</option>
                  <option value="stand by event">Stand By Event</option>
                  <option value="other">Other</option>
                </select>
                <label>Location</label>
                <select
                  className="inputStyle1"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  style={{ cursor: "pointer" }}
                >
                  <option value="">Select Location</option>
                  <option value="office">Office</option>
                  <option value="event">Event</option>
                </select>

                <label>Description</label>
                <input
                  className="inputStyle"
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />

                <div className="submitContiner">
                  <button
                    type="button"
                    className="submitButton submitClose"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submitButton submitSubmit">
                    Next
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isSuccessModalOpen && (
          <div className="popMainSuccess">
            <div className="popMainContainerSuccess">
              <h2> Laptop Details</h2>
              <form onSubmit={handleFinalSubmit}>
                <label>Model</label>
                <input
                  className="inputStyleSuccess"
                  type="text"
                  name="Model"
                  value={formData.Model}
                  onChange={handleChange}
                />
                <label>SerialNumber</label>
                <input
                  className="inputStyleSuccess"
                  type="text"
                  name="SerialNumber"
                  value={formData.SerialNumber}
                  onChange={handleChange}
                />
                <label>Processor </label>
                <input
                  className="inputStyleSuccess"
                  type="text"
                  name="Processor "
                  value={formData.Processor}
                  onChange={handleChange}
                />
                <label>Ram</label>
                <input
                  className="inputStyleSuccess"
                  type="text"
                  name="Ram"
                  value={formData.Ram}
                  onChange={handleChange}
                />
                <label>Storage</label>
                <input
                  className="inputStyleSuccess"
                  type="text"
                  name="Storage"
                  value={formData.Storage}
                  onChange={handleChange}
                />
                <label>Other</label>
                <input
                  className="inputStyleSuccess"
                  type="text"
                  name="Other"
                  value={formData.Other}
                  onChange={handleChange}
                />

                <label>Remark</label>
                <input
                  className="inputStyleSuccess"
                  type="text"
                  name="Remark"
                  value={formData.Remark}
                  onChange={handleChange}
                />

                <div className="submitContiner">
                  <button
                    type="button"
                    className="submitButton"
                    style={{ background: "#6c757d" }} // අළු පැහැයක් ලබා දී ඇත
                    onClick={() => {
                      setIsSuccessModalOpen(false); // දෙවන Modal එක වසන්න
                      setIsModalOpen(true); // පළමු Modal එක නැවත අරින්න
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="submitButton submitClose"
                    onClick={() => setIsSuccessModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submitButton submitSubmit"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isDeleteModalOpen && (
          <div className="popMain" style={{ zIndex: 3000 }}>
            <div
              className="popMainContainer"
              style={{ textAlign: "center", width: "350px" }}
            >
              <h3 style={{ color: "#fff" }}>Confirm Deletion</h3>
              <p style={{ color: "#bbb", fontSize: "14px" }}>
                Enter login password to delete this laptop record:
              </p>

              <input
                type="password"
                className="inputStyle"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter Password"
                style={{ marginBottom: "20px" }}
              />

              <div className="submitContiner">
                <button
                  onClick={confirmAndDelete}
                  className="submitButton submitClose"
                >
                  DELETE
                </button>
                <button
                  onClick={closeDeleteModal}
                  className="submitButton"
                  style={{ background: "#666" }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Laptop;
