/**
 * Generates the header with a blue line on top, a box containing fields aligned to the right and left, 
 * and adds an image at the bottom right and a line image at the bottom.
 * @param {Object} doc - PDFKit document instance.
 * @param {Object} data - Account data to be printed in the header.
 */
const header = (doc, data) => {
  const leftMargin = 60;
  const topMargin = 70;
  const labelWidth = 80; // Reduced for less horizontal space
  const valueXOffset = 38; // Reduced for less horizontal space
  const boxWidth = 360; // Width of the box containing fields
  const boxHeight = 130; // Height of the box

  // Box's X position (right-aligned)
  const boxX = doc.page.width - boxWidth - 50;

  doc.registerFont("Calibri", "./Fonts/calibri.ttf");
  doc.registerFont("CalibriBold", "./Fonts/calibrib.ttf");

  // Add the Logo (shifted to the left)
  const logoPath = "./images/ub.jpg";
  const logoWidth = 300;
  const logoHeight = 70;
  const logoX = 1; // Set to 10 to align it with the left side
  const logoY = topMargin - 70; // Keeping the vertical position aligned with the blue line
  doc.image(logoPath, logoX, logoY, { width: logoWidth, height: logoHeight });

  // Add a blue line image on the right of the logo (aligned with the top)
  const blueLinePath = "./images/line.jpg"; // Path to your blue line image
  const blueLineWidth = 1000; // Adjust the width of the blue line
  const blueLineHeight = 13; // Height of the blue line (can be adjusted based on the design)
  const blueLineX = logoX + logoWidth + 0; // Positioning the blue line to the right of the logo
  const blueLineY = topMargin - 70; // Aligning the blue line with the logo vertically
  doc.image(blueLinePath, blueLineX, blueLineY, { width: blueLineWidth, height: blueLineHeight });

  // Add the image for the header (instead of text)
  const headerImagePath = "./images/ac.png"; // Path to your header image
  const headerImageWidth = 250; // Width of the image (you can adjust this)
  const headerImageHeight = 40; // Height of the image (you can adjust this)
  const headerImageX = boxX + (boxWidth - headerImageWidth) / 2; // Position to center the image
  const headerImageY = topMargin - 40; // Adjusted upward, same position as where the header text would have been

  // Place the image at the header position
  doc.image(headerImagePath, headerImageX, headerImageY, { width: headerImageWidth, height: headerImageHeight });

  // Add spacing between the header image and the box
  const boxStartY = topMargin + 30; // Increased spacing here

  // Define fields to be printed inside the box (aligned to the right)
  const rightAlignedFields = [
    { label: "Statement Period", value: data["Statement Period"] },
    { label: "Account No:", value: data["Account No"] },
    { label: "Account Title:", value: data["Account Title"] },
    { label: "Product Type:", value: data["Product Type"] },
    { label: "Currency:", value: data["Currency"] },
    { label: "Balance:", value: data["Balance"] },
    { label: "As of:", value: formatDate(data["As of"]) },
  ];

  // Define fields to be printed on the left (no labels, just values)
  const leftAlignedFields = [
    { value: data["Branch"], shiftRight: true }, // Add a flag to shift "Branch" value to the right
    { value: data["Account Title"] },
    { value: data["Address"] },
    { label: "Reg Cell No", value: data["Reg Cell No"] },
    { label: "IBAN", value: data["IBAN"] },
  ];

  let currentY = boxStartY;
  const fieldSpacing = 3;
  const branchShiftX = 15; // Add horizontal shift for the "Branch" field to the right

  // Draw the box for right-aligned fields
  doc.rect(boxX, currentY - 10, boxWidth, boxHeight).stroke();

  // Print right-aligned fields inside the box
  rightAlignedFields.forEach((field, index) => {
    const fieldY = currentY + index * (fieldSpacing + 13);
    doc.fontSize(11).font("Helvetica-Bold").text(field.label, boxX + 10, fieldY);
    const valueX = boxX + labelWidth + valueXOffset;
    doc.font("Helvetica-Bold").text(field.value, valueX, fieldY);
  });

  // Adjust Y position for left-aligned fields (move to the top-left corner)
  currentY = boxStartY;

 // Print left-aligned fields at the top left
leftAlignedFields.forEach((field, index) => {
  let fieldY = currentY + index * (fieldSpacing + 13);

  // Add extra spacing after the first three fields
  if (index >= 3) {
    fieldY += 15; // Add extra spacing for fields after the third one
  }

  if (field.value) {
    if (field.shiftRight) {
      const valueX = 30; // Move the "Branch" value to the far left (close to the document margin)
      doc.font("CalibriBold").text(field.value, valueX, fieldY);
    } else if (field.label) {
      doc.fontSize(13).font("CalibriBold").text(field.label + ":", 5, fieldY); // Label on the far left

      // Adjust value position for specific labels
      let valueX = 55; // Default value position
      if (field.label === "Reg Cell No") {
        valueX = 75; // Add extra spacing for "Reg Cell No" value
      }

      doc.font("CalibriBold").text(field.value, valueX, fieldY);
    } else {
      // For Address field, use Calibri font instead of Calibri-Bold
      if (field.value === data["Address"]) {
        doc.font("Calibri").text(field.value, 5, fieldY); // Use Calibri font for Address
      } else {
        const valueX = 5; // Value without a label aligned to the far left
        doc.font("CalibriBold").text(field.value, valueX, fieldY); // Apply Calibri-Bold for other fields
      }
    }
  }
});


  // Add additional spacing after the fields
  currentY += (leftAlignedFields.length - 1) * (fieldSpacing + 13) + 10; // Add extra spacing after the fields
// ** New part: Add the text above the bottom image on the left side **
const text = "Note: The items and balance shown on this statement should be verified and the branch manager notified within 2 weeks of any discrepancies, otherwise it will be assumed as correct."; 

const textX = 5; // Position the text on the left side
const textY = doc.page.height - 90; // Adjusted Y position, above the bottom image

// Add the text with automatic word wrapping and ensure proper line breaks
doc.fontSize(8).font("Helvetica").text(text, textX, textY, {
  width: doc.page.width - 10, // Set a width limit for the text to wrap within the page's boundaries
  align: 'left', // Align text to the left
  lineBreak: true, // Enable line break
  lineGap: 4 // Optional: Add extra gap between lines for better readability
});


  // ** New part: Add the image at the bottom right of the page **
  const bottomImagePath = "./images/ftt.jpg"; // Path to your image
  const bottomImageWidth = 300;
  const bottomImageHeight = 70;
  const bottomImageX = doc.page.width - bottomImageWidth - 2; // 50px from the right
  const bottomImageY = doc.page.height - bottomImageHeight - 20; // 50px from the bottom
  doc.image(bottomImagePath, bottomImageX, bottomImageY, { width: bottomImageWidth, height: bottomImageHeight });

  // ** New part: Add the line image at the bottom **
  const lineImagePath = "./images/line.jpg"; // Path to your line image
  const lineImageWidth = 1000; // Width of the line image
  const lineImageHeight = 11; // Height of the line image (same as the top blue line)
  const lineImageX = 0; // Position the line image starting from the left
  const lineImageY = doc.page.height - lineImageHeight - 20; // Position the line 50px from the bottom
  doc.image(lineImagePath, lineImageX, lineImageY, { width: lineImageWidth, height: lineImageHeight });

};

/**
 * Formats the date into a more readable form.
 * @param {string} dateStr - The date string to format.
 * @returns {string} - The formatted date string.
 */
const formatDate = (dateStr) => {
  if (!dateStr) return "N/A"; // Handle missing date
  const date = new Date(dateStr);
  if (isNaN(date)) return "Invalid Date"; // Handle invalid date
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return date.toLocaleDateString("en-US", options);
};


module.exports = { header };
