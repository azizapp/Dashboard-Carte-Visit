/**
 * Store Management System - Data Processor (v3.0)
 * Transforms "RawData" into "Customers" and "Visits" sheets.
 * Headers are strictly aligned with user requirements.
 */

function processStoreData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Setup Sheets
  let rawSheet = ss.getSheetByName("RawData");
  if (!rawSheet) {
    safeAlert("Error: Sheet 'RawData' not found!");
    return;
  }
  
  let customerSheet = getOrCreateSheet(ss, "customers");
  let visitsSheet = getOrCreateSheet(ss, "visits");
  
  const data = rawSheet.getDataRange().getValues();
  if (data.length < 2) {
    safeAlert("No data found in RawData.");
    return;
  }
  
  const headers = data[0];
  const rows = data.slice(1);
  
  // Mapping indices based on typical raw data headers
  const idx = {
    id: headers.indexOf("ID"),
    date: headers.indexOf("Date"),
    shop: headers.indexOf("Magazin"),
    manager: headers.indexOf("Le Gérant"),
    city: headers.indexOf("Ville"),
    region: headers.indexOf("Région"),
    address: headers.indexOf("Adresse"),
    gsm1: headers.indexOf("GSM1"),
    gsm2: headers.indexOf("GSM2"),
    phone: headers.indexOf("Phone"),
    email: headers.indexOf("Email"),
    gamme: headers.indexOf("Gamme"),
    action: headers.indexOf("Action Client"),
    price: headers.indexOf("Prix"),
    qty: headers.indexOf("Quantité"),
    user: headers.indexOf("USER"),
    note: headers.indexOf("Note"),
    image: headers.indexOf("Image"),
    location: headers.indexOf("Localisation"),
    contacted: headers.indexOf("Contacté"),
    discussed: headers.indexOf("Discuté"),
    appointment: headers.indexOf("Rendez-Vous"),
    blocked: headers.indexOf("is_blocked")
  };

  const customersMap = {};
  const visitsList = [];
  let customerCounter = 1;

  // 2. Process Rows
  rows.forEach(row => {
    const shopName = row[idx.shop]?.toString().trim();
    const city = row[idx.city]?.toString().trim();
    
    if (!shopName) return;

    // Unique key (Shop Name + City)
    const customerKey = (shopName + "_" + city).toLowerCase();

    if (!customersMap[customerKey]) {
      const customerId = "C" + ("000" + customerCounter++).slice(-4);
      customersMap[customerKey] = {
        id: customerId,
        name: shopName,
        manager: row[idx.manager] || "",
        location: row[idx.location] || "",
        city: city,
        region: row[idx.region] || "",
        address: row[idx.address] || "",
        gsm1: row[idx.gsm1] || "",
        gsm2: row[idx.gsm2] || "",
        phone: row[idx.phone] || "",
        email: row[idx.email] || "",
        gamme: row[idx.gamme] || "Moyenne",
        user_email: row[idx.user] || "",
        is_blocked: (row[idx.blocked] === true || row[idx.blocked] === "TRUE" || row[idx.blocked] === "Yes") ? "Yes" : "No"
      };
    }

    // Create Visit Entry linked to Customer ID
    visitsList.push([
      row[idx.id] || "V" + Date.now() + Math.floor(Math.random() * 1000), // id (visit id)
      customersMap[customerKey].id,                                      // customer_id (Link)
      row[idx.action] || "Visite",                                       // action
      row[idx.appointment] || "",                                        // appointment_date
      row[idx.note] || "",                                               // note
      row[idx.contacted] || "",                                          // contacted
      row[idx.discussed] || "",                                          // discussed
      row[idx.price] || 0,                                               // price
      row[idx.qty] || 0,                                                 // quantity
      row[idx.image] || "",                                              // image
      row[idx.user] || ""                                                // user_email
    ]);
  });

  // 3. Write Customers Data
  const customerHeaders = ["id", "name", "manager", "location", "city", "region", "address", "gsm1", "gsm2", "phone", "email", "gamme", "user_email", "is_blocked"];
  const customerOutput = [customerHeaders];
  for (let key in customersMap) {
    let c = customersMap[key];
    customerOutput.push([c.id, c.name, c.manager, c.location, c.city, c.region, c.address, c.gsm1, c.gsm2, c.phone, c.email, c.gamme, c.user_email, c.is_blocked]);
  }
  writeToSheet(customerSheet, customerOutput);

  // 4. Write Visits Data
  const visitHeaders = ["id", "customer_id", "action", "appointment_date", "note", "contacted", "discussed", "price", "quantity", "image", "user_email"];
  const visitOutput = [visitHeaders];
  visitsList.forEach(v => visitOutput.push(v));
  writeToSheet(visitsSheet, visitOutput);

  safeAlert("Process Complete!\nSynced " + (customerCounter-1) + " unique customers and " + (visitOutput.length - 1) + " interactions.");
}

/**
 * Helper: Write data and format headers
 */
function writeToSheet(sheet, data) {
  sheet.clear();
  if (data.length > 0) {
    sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
    const headerRange = sheet.getRange(1, 1, 1, data[0].length);
    headerRange.setFontWeight("bold")
               .setBackground("#4f46e5")
               .setFontColor("white")
               .setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, data[0].length);
  }
}

/**
 * Helper: Get or Create sheet by name
 */
function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

/**
 * Safe Alert: Prevents execution error when called from non-UI context
 */
function safeAlert(message) {
  Logger.log(message);
  try {
    SpreadsheetApp.getUi().alert(message);
  } catch (e) {
    // UI context not available
  }
}