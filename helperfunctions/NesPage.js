/**
 * Generates the header for subsequent pages with selected fields and images.
 * @param {Object} doc - PDFKit document instance.
 * @param {Object} data - Account data to be printed on the page.
 */
const headerSubsequentPages = (doc, data) => {
  const topMargin = 70;
  const boxWidth = 360;
  const boxHeight = 130;

  doc.registerFont("CalibriBold", "./Fonts/calibrib.ttf");

  // Box's X position (right-aligned)
  const boxX = doc.page.width - boxWidth - 50;

  // Add the Logo (always visible on all pages)
  const logoPath = "./images/ub.jpg";
  const logoWidth = 300;
  const logoHeight = 70;
  const logoX = 1;
  const logoY = topMargin - 70;
  doc.image(logoPath, logoX, logoY, { width: logoWidth, height: logoHeight });

  // Add the image for the header (instead of text)
  const headerImagePath = "./images/ac.png"; // Path to your header image
  const headerImageWidth = 250; // Width of the image (you can adjust this)
  const headerImageHeight = 40; // Height of the image (you can adjust this)
  const headerImageX = boxX + (boxWidth - headerImageWidth) / 2; // Position to center the image
  const headerImageY = topMargin - 40; // Adjusted upward, same position as where the header text would have been

  // Place the image at the header position
  doc.image(headerImagePath, headerImageX, headerImageY, { width: headerImageWidth, height: headerImageHeight });

  // Add blue line (always visible on all pages)
  const blueLinePath = "./images/line.jpg";
  const blueLineWidth = 1000;
  const blueLineHeight = 13;
  const blueLineX = logoX + logoWidth;
  const blueLineY = topMargin - 70;
  doc.image(blueLinePath, blueLineX, blueLineY, { width: blueLineWidth, height: blueLineHeight });

  // Add the text above the bottom image on the left side
  const text = "Note: The items and balance shown on this statement should be verified and the branch manager notified within 2 weeks of any discrepancies, otherwise it will be assumed as correct."; 
  const textX = 5; // Position the text on the left side
  const textY = doc.page.height - 90; // Adjusted Y position, above the bottom image
  doc.fontSize(8).font("Helvetica").text(text, textX, textY, {
      width: doc.page.width - 10, // Set a width limit for the text to wrap within the page's boundaries
      align: 'left', // Align text to the left
      lineBreak: true, // Enable line break
      lineGap: 4 // Optional: Add extra gap between lines for better readability
  });

  // Ensure the left-aligned fields (Address and Account Title) are printed correctly
  const leftAlignedFields = [
    { value: data["Address"] || "N/A" }, // Use "N/A" if the value is not present
    {  value: data["Account Title"] || "N/A" } // Same for Account Title
  ];

  const currentY = topMargin + 30; // Starting Y position for fields

  leftAlignedFields.forEach((field, index) => {
      const fieldY = currentY + index * (13 + 3);
      const valueX = (index === 0) ? 70 : 50; // Address moved to the right

      // Ensure the value is printed using a regular font
      doc.font("CalibriBold").fontSize(13).text(field.value, valueX, fieldY);
  });

  // Add the image at the bottom right of the page
  const bottomImagePath = "./images/ftt.jpg";
  const bottomImageWidth = 300;
  const bottomImageHeight = 70;
  const bottomImageX = doc.page.width - bottomImageWidth - 2;
  const bottomImageY = doc.page.height - bottomImageHeight - 20;
  doc.image(bottomImagePath, bottomImageX, bottomImageY, { width: bottomImageWidth, height: bottomImageHeight });

  // Add the line image at the bottom
  const lineImagePath = "./images/line.jpg";
  const lineImageWidth = 1000;
  const lineImageHeight = 11;
  const lineImageX = 0;
  const lineImageY = doc.page.height - lineImageHeight - 20;
  doc.image(lineImagePath, lineImageX, lineImageY, { width: lineImageWidth, height: lineImageHeight });
};

module.exports = { headerSubsequentPages };
