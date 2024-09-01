const fs = require('fs');
const {google} = require('googleapis');

// Path to your service account key file
const SERVICE_ACCOUNT_FILE = 'path_to_credentials.json';

// The ID and range of your spreadsheet
const SPREADSHEET_ID = '1ShrN0XuOzU29HV-zaRcrPcIxdfrnSsSccCr1nnHIvuw'; // Replace with your Spreadsheet ID
const RANGE = 'data1!A1:D5'; // Replace with the range where you want to insert data

// Load the service account key file
const credentials = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE));

// Configure a JWT auth client
const auth = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

// Authenticate request
auth.authorize((err, tokens) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Successfully connected!');
  insertData(auth);
});

function insertData(auth) {
  const sheets = google.sheets({version: 'v4', auth});

  const values = [
    ['Name', 'Age', 'Gender', 'Location'],
    ['Jhn Doe', 28, 'Male', 'New York'],
    ['Jne Doe', 26, 'Female', 'San Francisco'],
    ['Sa Smith', 30, 'Male', 'Chicago'],
    ['Lsa Ray', 29, 'Female', 'Boston'],
  ];

  const resource = {
    values,
  };

  sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
    valueInputOption: 'RAW',
    resource,
  }, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`${result.data.updatedCells} cells updated.`);
    }
  });
}
