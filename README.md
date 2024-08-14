# Google Apps Script: Automated Document Access Management

This Google Apps Script automates the process of granting temporary access to Google Drive documents based on incoming Gmail requests. The script processes emails labeled as "accessRequested," shares the requested document with specified recipients, and schedules automatic revocation of access after a set period.

## Features

- **Automatic Document Sharing**: Automatically shares Google Drive documents in specified folders based on email requests.
- **Multiple Recipients**: Handles multiple email addresses in the request and shares the document with all of them.
- **Scheduled Access Revocation**: Automatically revokes access after a configurable period.
- **Logging**: Logs all actions, including document sharing and notifications sent, along with the recipients' email addresses.
- **Email Notifications**: Sends notifications to recipients when access is granted, and optionally notifies the requester as well.

## Prerequisites

- A Google account with access to Google Drive and Gmail.
- Basic familiarity with Google Apps Script and Google Drive folder structures.

## Setup

### 1. **Create a Google Apps Script Project**

1. Go to [Google Apps Script](https://script.google.com/).
2. Create a new project.
3. Name your project.

### 2. **Add the Script Files**

1. **Main Script (`main.gs`)**: Add the provided `main.gs` script into your project.
2. **Configuration Script (`config.gs`)**: Create a separate script file named `config.gs` and add your configuration variables:

   ```javascript
   var PARENT_FOLDER_ID = "0ABCDEFG12345HIJKLMNO6789PQRSTUV"; // Replace with your actual folder ID this is not the url, but the alphanumeric fragment that identifies the folder
   var REVOKE_AFTER = 24; // Revoke access after n hours
   var REPLY_MESSAGE = "Temporary access has been granted to the requested document for <<n>> hours. Please onboard at <<your onboarding link>> for permanent access.";
