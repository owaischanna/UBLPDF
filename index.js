const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");

const { readExcelFile } = require("./helperfunctions/ExcelGen");
const { generatePDF } = require("./helperfunctions/PdfGen");



const upload = multer({ dest: "uploads/" });

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Serve the HTML form at the root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// API Endpoint for PDF Generation
app.post("/generate-pdf", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Read the uploaded Excel file using helper function
    const sheetData = readExcelFile(req.file.path);

    if (!sheetData || sheetData.length === 0) {
      return res.status(400).json({ error: "Uploaded file is empty or invalid" });
    }

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="statement.pdf"');

    // Generate PDF using helper function
    generatePDF(sheetData, res);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "An error occurred while generating the PDF." });
  }
});

// Start the Server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
