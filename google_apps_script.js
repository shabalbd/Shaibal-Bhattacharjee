function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SiteData");
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Sheet 'SiteData' not found" })).setMimeType(ContentService.MimeType.JSON);
  }
  
  var data = sheet.getRange("B1").getValue();
  try {
    var parsed = JSON.parse(data);
    return ContentService.createTextOutput(JSON.stringify(parsed)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: "No valid JSON found in cell B1" })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SiteData");
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("SiteData");
    sheet.getRange("A1").setValue("site_data");
  }
  
  try {
    var postData = JSON.parse(e.postData.contents);
    sheet.getRange("B1").setValue(JSON.stringify(postData, null, 2));
    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Invalid JSON payload" })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  // Return CORS headers for preflight requests if called directly from browser
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  return ContentService.createTextOutput("").setHeaders(headers);
}
