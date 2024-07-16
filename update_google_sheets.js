const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Load client secrets from a local file.
const credentialsPath = path.join(__dirname, 'path_to_credentials.json');
const credentials = require(credentialsPath);
const client = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

client.authorize((err, tokens) => {
  if (err) {
    console.error('Error authorizing client:', err);
    return;
  }

  const sheets = google.sheets({ version: 'v4', auth: client });
  const spreadsheetId = '1ShrN0XuOzU29HV-zaRcrPcIxdfrnSsSccCr1nnHIvuw';
  const range = 'Sheet1!A1';

  // Read the Postman response JSON file
  const responsePath = path.join(__dirname, 'postman_response.json');
  fs.readFile(responsePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }
    
    const response = JSON.parse(data);
    // Extract and format your data from the response
    const values = response.run.executions.map(execution => [
      execution.item.name,
      execution.request.url,
      execution.response.status,
      execution.response.code,
      execution.response.stream ? execution.response.stream.toString() : ''
    ]);

    const resource = {
      values,
    };

    sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource,
    }, (err, result) => {
      if (err) {
        console.error('Error writing to Google Sheets:', err);
      } else {
        console.log(`${result.data.updates.updatedCells} cells appended.`);
      }
    });
  });
});
