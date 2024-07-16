const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const serviceAccountKeyFile = "./path_to_credentials.json";
const sheetId = '1ShrN0XuOzU29HV-zaRcrPcIxdfrnSsSccCr1nnHIvuw';
const tabName = 'data1';
const range = 'A:E';

main().then(() => {
  console.log('Completed');
}).catch(err => {
  console.error('Error:', err);
});

async function main() {
  // Generate google sheet client
  const googleSheetClient = await getGoogleSheetClient();

  // Simulate parsing JSON response (replace with your actual JSON parsing logic)
  const jsonResponse = [
    { id: '11', username: 'rohith', firstName: 'Rohith', lastName: 'Sharma', status: 'Active' },
    { id: '12', username: 'virat', firstName: 'Virat', lastName: 'Kohli', status: 'Active' }
  ];

  // Prepare data to be inserted into Google Sheet
  const dataToBeInserted = jsonResponse.map(item => [
    item.id,
    item.username,
    item.firstName,
    item.lastName,
    item.status
  ]);

  // Write data to Google Sheet
  await writeGoogleSheet(googleSheetClient, sheetId, tabName, range, dataToBeInserted);
}

async function getGoogleSheetClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: serviceAccountKeyFile,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const authClient = await auth.getClient();
  return google.sheets({ version: 'v4', auth: authClient });
}

async function writeGoogleSheet(googleSheetClient, sheetId, tabName, range, data) {
  await googleSheetClient.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${tabName}!${range}`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      "majorDimension": "ROWS",
      "values": data
    },
  });
}
