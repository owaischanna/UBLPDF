const xlsx = require("xlsx");

/**
 * Converts Excel date serial numbers or strings to a formatted date.
 * @param {number|string} excelDate - Excel date serial number or date string.
 * @returns {string} - Formatted date string.
 */
const parseExcelDate = (excelDate) => {
  if (!excelDate) return ""; // Handle empty date fields

  // Handle Excel serial numbers
  if (typeof excelDate === "number") {
    const epoch = new Date(1899, 11, 30); // Excel epoch starts on December 30, 1899
    return new Date(epoch.getTime() + excelDate * 86400000).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // Handle string dates
  if (typeof excelDate === "string") {
    const date = new Date(excelDate);
    if (!isNaN(date)) {
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }

  return "Invalid Date"; // Return fallback for unrecognized formats
};

/**
 * Reads data from the Excel file and extracts metadata and transaction data.
 * @param {string} filePath - Path to the Excel file.
 * @returns {Object} - Account metadata and transaction data extracted from the Excel sheet.
 */
const readExcelFile = (filePath) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Get the first sheet
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

    const accountInfo = {}; // For storing metadata
    const transactions = []; // For storing transaction data

    // Flag to determine when transaction data starts
    let transactionStart = false;

    // Loop through each row to parse metadata and transaction data
    sheetData.forEach((row) => {
      const label = row[0]?.toString().trim(); // First column (for metadata)
      const value = row[1]; // Second column (for metadata)

      // Parse Metadata (Account Info)
      if (!transactionStart && label && value) {
        if (label.includes("Branch")) accountInfo["Branch"] = value;
        if (label.includes("Statement Period")) accountInfo["Statement Period"] = value;
        if (label.includes("Account Title")) accountInfo["Account Title"] = value;
        if (label.includes("Account No")) accountInfo["Account No"] = value;
        if (label.includes("IBAN")) accountInfo["IBAN"] = value;
        if (label.includes("Currency")) accountInfo["Currency"] = value;
        if (label.includes("Product Type")) accountInfo["Product Type"] = value;
        if (label.includes("Balance")) accountInfo["Balance"] = value;
        if (label.includes("As of")) accountInfo["As of"] = parseExcelDate(value); // Use updated parser
        if (label.includes("Address")) accountInfo["Address"] = value;
        if (label.includes("Reg Cell No")) accountInfo["Reg Cell No"] = value;
      }

      // Detect when transaction data starts
      if (label && label.toLowerCase().includes("date") && row.length >= 4) {
        console.log("Transaction header detected. Starting transaction parsing...");
        transactionStart = true;
        return; // Skip the header row
      }

      // Parse Transaction Data
      if (transactionStart) {
        const transaction = {
          Date: parseExcelDate(row[0]) || "", // Handle empty date field
          Particulars: row[1] || "", // Handle missing particulars
          "Inst No.": row[2] || "", // Handle missing instrument number
          Debit: row[3] || "", // Handle missing debit
          Credit: row[4] || "", // Handle missing credit
          Balance: row[5] || "", // Handle missing balance
        };

        // Add transaction if at least one key field is valid
        if (transaction.Date || transaction.Particulars || transaction.Debit || transaction.Credit) {
          transactions.push(transaction);
        }
      }
    });

    console.log("Parsed Account Info:", accountInfo);
    return { accountInfo, transactions }; // Return both account info and transaction data
  } catch (error) {
    console.error("Error reading Excel file:", error);
    throw error;
  }
};

module.exports = { readExcelFile };
