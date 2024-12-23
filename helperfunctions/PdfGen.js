const PDFDocument = require("pdfkit");
const { header } = require("./header");
const{ generateTableFromExcelData}=require("./TableGen");
const{headerSubsequentPages}=require("./NesPage");

const generatePDF = (data, res) => {
  try {
    const doc = new PDFDocument({ size: [959.76, 1344.24],  }); // US Letter size
    doc.pipe(res);

    // Call header function to add the header to the PDF
    header(doc, data.accountInfo);

 

    //Table Generation
    generateTableFromExcelData(doc,data);


    doc.end();
  } catch (error) {
    throw new Error("Error generating PDF: " + error.message);
  }
};

module.exports = { generatePDF };
