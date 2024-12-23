const { header } = require('./header');
const { headerSubsequentPages } = require('./NesPage');

const generateTableFromExcelData = (
  doc,
  data,
  headers = ["Date", "Particulars", "Inst No.", "Debit", "Credit", "Balance"],
  columnWidths = [],
  leftMargin = 48,
  topMargin = 250, // Consistent top margin for all pages
  defaultRowHeight = 48,
  maxRowsPerPage = 18,
  footerHeight = 20
) => {
  doc.registerFont("Calibri", "./Fonts/calibri.ttf");
  doc.registerFont("CalibriBold", "./Fonts/calibrib.ttf");

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const pageMargin = 50;
  const usableWidth = pageWidth - pageMargin * 2;

  const defaultColumnWidths = [1, 3, 1, 1, 1, 1];
  columnWidths =
    columnWidths.length > 0
      ? columnWidths
      : defaultColumnWidths.map((ratio) => (ratio / defaultColumnWidths.reduce((a, b) => a + b)) * usableWidth);

  let currentY = topMargin;
  let currentPage = 1;

  const validateData = (data) => {
    return data.transactions.filter(
      (row) => !(row["Date"] === "Date" || row["Particulars"] === "Particulars" || !row["Date"] || !row["Particulars"])
    );
  };

  const sanitizedData = validateData(data);

  const calculateTotalPages = () => {
    const rowsCount = sanitizedData.length;
    return Math.ceil(rowsCount / maxRowsPerPage);
  };

  const totalPages = calculateTotalPages();

  const drawHeader = () => {
    const headerHeight = 30; // Increased height for the header row
    const headerFontSize = 18; // Increased font size for header text

    // Draw header background
    const headerWidth = columnWidths.reduce((a, b) => a + b);
    doc.rect(leftMargin, currentY, headerWidth, headerHeight).fill("#2245E8"); // Gray background

    let x = leftMargin;

    // Draw header row with vertical lines
    headers.forEach((header, i) => {
      const align = ["Debit", "Credit", "Balance"].includes(header) ? "center" : header === "Date" ? "center" : "center";

      doc.font("CalibriBold").fontSize(headerFontSize).fillColor("black").text(header, x + 5, currentY + 5, {
        width: columnWidths[i] - 10,
        align,
      });

      // Vertical line between columns
      doc.moveTo(x, currentY).lineTo(x, currentY + headerHeight).stroke();

      x += columnWidths[i];
    });

    // Right border for the last column
    doc.moveTo(leftMargin + columnWidths.reduce((a, b) => a + b), currentY)
      .lineTo(leftMargin + columnWidths.reduce((a, b) => a + b), currentY + headerHeight)
      .stroke();

    // Horizontal line under header
    doc.moveTo(leftMargin, currentY + headerHeight)
      .lineTo(leftMargin + columnWidths.reduce((a, b) => a + b), currentY + headerHeight)
      .stroke();

    currentY += headerHeight; // Move currentY down by header height
  };

  const drawFooter = (currentPage, totalPages) => {
    doc.font("CalibriBold").fontSize(12).text(`Page ${currentPage} of ${totalPages}`, doc.page.width - 60, doc.page.height - 15, { // Adjusted Y position
      align: "right",
    });
  };

  const addPageBreak = () => {
    drawFooter(currentPage, totalPages); // Draw footer before adding a page break

    // Draw bottom horizontal line for current page
    doc.moveTo(leftMargin, currentY)
      .lineTo(leftMargin + columnWidths.reduce((a, b) => a + b), currentY)
      .stroke();

    doc.addPage();
    currentPage++;
    currentY = topMargin; // Reset Y position for the new page

    // Use reduced top margin for subsequent pages
    const subsequentPageTopMargin = 135; // Reduced margin
    currentY = subsequentPageTopMargin;

    // Ensure data.accountInfo exists before calling the function
    if (data.accountInfo) {
      headerSubsequentPages(doc, data.accountInfo);
    } else {
      console.error("Error: accountInfo is not available in data");
    }

    drawHeader(); // Redraw the header for the new page
  };

  const drawRows = () => {
    let rowCount = 0;

    sanitizedData.forEach((row, rowIndex) => {
      // Check if a new page is needed
      if (rowCount >= maxRowsPerPage || currentY + defaultRowHeight + footerHeight > pageHeight) {
        addPageBreak(); // Add a new page and redraw the header
        rowCount = 0; // Reset row count for the new page
      }

      let x = leftMargin;
      let rowHeight = rowIndex === 0 || currentPage === 1 ? defaultRowHeight : defaultRowHeight + 10; // Increased row height on subsequent pages

      headers.forEach((header, i) => {
        let value = row[header] || ""; // Replace undefined or null values with an empty string
        const align = header === "Date" ? "center" : header === "Particulars" ? "left" : "right";
  
        if (["Debit", "Credit", "Balance"].includes(header) && value !== "") {
          value = parseFloat(value).toLocaleString("en-US", { minimumFractionDigits: 2 });
        }

        const options = { width: columnWidths[i] - 10, align, lineBreak: true };
        const textHeight = doc.heightOfString(value, options);
        rowHeight = Math.max(rowHeight, textHeight + 5);

        doc.font("Calibri").fontSize(15).text(value, x + 5, currentY + 5, options);

        // Draw vertical line between columns
        doc.moveTo(x, currentY).lineTo(x, currentY + rowHeight).stroke();

        x += columnWidths[i];
      });

      // Right border for the last column
      doc.moveTo(leftMargin + columnWidths.reduce((a, b) => a + b), currentY)
        .lineTo(leftMargin + columnWidths.reduce((a, b) => a + b), currentY + rowHeight)
        .stroke();

      currentY += rowHeight;
      rowCount++;
    });

    // Draw the last horizontal line (bottom border) after all rows
    doc.moveTo(leftMargin, currentY)
      .lineTo(leftMargin + columnWidths.reduce((a, b) => a + b), currentY)
      .stroke();
  };

  // Draw header for the first page
  drawHeader();

  // Draw all rows and ensure the bottom line is drawn
  drawRows();

  // Draw footer on the last page
  drawFooter(currentPage, totalPages);
};

module.exports = { generateTableFromExcelData };
