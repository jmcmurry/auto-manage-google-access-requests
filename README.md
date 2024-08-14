# Google Apps Script: Automated Document Access Management

In large multi-institutional projects it is common that people who need access to docouments have not necessarily gone through the proper onboarding channels. However, it is also the case that not all files are sensitive to share. Working from the assumption that if they're requesting access they need it and should onboard, this script achieves a happy compromise. This Google Apps Script automates the process of granting temporary access (view or edit) to Google Drive documents based on incoming Gmail requests. The script processes emails labeled as "accessRequested," shares the requested document with specified recipients, and schedules automatic revocation of access after a set period.

## Features

- **Automatic Document Sharing**: Automatically shares Google Drive documents in specified folders based on email requests.
- **Multiple Recipients**: Handles multiple email addresses in the request and shares the document with all of them.
- **Scheduled Access Revocation**: Automatically revokes access after a configurable period.
- **Logging**: Logs all actions, including document sharing and notifications sent, along with the recipients' email addresses.
- **Email Notifications**: Sends notifications to recipients when access is granted, and optionally notifies the requester as well if different.

## Prerequisites

- A Google account with access to Google Drive and Gmail.
- Basic familiarity with Google Apps Script and Google Drive folder structures.

## Setup

### 1. **Create a Google Apps Script Project**

1. Sign into Google and go to [Google Apps Script](https://script.google.com/).
2. Create a new project.
3. Name your project.

### 2. **Add the Script Files**

1. **Main Script (`main.gs`)**: Add the provided `main.gs` script into your project.
2. **Configuration Script (`config.gs`)**: Create a separate script file named `config.gs` and add your configuration variables:

   ```javascript
   var PARENT_FOLDER_ID = "0ABCDEFG12345HIJKLMNO6789PQRSTUV"; // Replace with your actual folder ID this is not the url, but the alphanumeric fragment that identifies the folder
   var REVOKE_AFTER = 24; // Revoke access after n hours
   var REPLY_MESSAGE = "Temporary access has been granted to the requested document for <<n>> hours. Please onboard at <<your onboarding link>> for permanent access.";

### 3. Set Up Gmail Labels
**Create Gmail Labels:**
- `accessRequests/accessRequested`: For incoming access requests.
- `accessRequests/accessGranted`: For requests that have been processed and granted.

### 4. Configure Triggers
**Set Up a Trigger to Run Hourly:**
- Go to Triggers in the Google Apps Script editor.
- Set up a trigger to run the `runHourly` function every hour to process new access requests.

### 5. Test the Script
**Send a Test Email:**

- Send an email to yourself that includes a request for access to a Google Drive document, using the configured email format.
- Make sure the email is labeled with `accessRequested`.

**Monitor Logs:**

- Check the Google Apps Script logs to verify that the script processes the request, shares the document, and logs all actions as expected.

## Usage
Once set up, the script will automatically run every hour (or according to your trigger settings) and process any new access requests. The documents will be shared with the specified recipients, and the access will be automatically revoked after the configured period.

### Workflow:
1. **Incoming Request**: An email with the subject line containing the request is received and labeled as `accessRequested`.
2. **Document Sharing**: The script processes the email, extracts the document URL, and shares the document with the specified email addresses.
3. **Notification**: Notifications are sent to the recipients to inform them that access has been granted.
4. **Access Revocation**: After the specified period (e.g., 24 hours), the script automatically revokes access to the document.

## Debugging and Logging
- **Logs**: All actions are logged, including which documents were shared, with whom, and when access is revoked.
- **Errors**: If any errors occur, they will be logged in the Google Apps Script console, allowing for easy debugging.

## Customization
- **Revocation Period**: Customize the `REVOKE_AFTER` variable in `config.gs` to change how long the access remains active.
- **Notification Message**: Update the `REPLY_MESSAGE` variable in `config.gs` to customize the notification message sent to recipients.

## Support
For any issues or questions, please refer to the Google Apps Script documentation or contact the project maintainer.

