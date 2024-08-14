function processAccessRequestsMain() {
  var labelRequested = GmailApp.getUserLabelByName('accessRequests/accessRequested');
  var labelGranted = GmailApp.getUserLabelByName('accessRequests/accessGranted');

  if (!labelRequested) {
    Logger.log("Label 'accessRequests/accessRequested' does not exist.");
    return;
  }

  if (!labelGranted) {
    Logger.log("Label 'accessRequests/accessGranted' does not exist.");
    return;
  }

  var threads = labelRequested.getThreads();
  Logger.log("Found " + threads.length + " threads with 'accessRequests/accessRequested' label.");

  var rootDriveFolderId = PARENT_FOLDER_ID; // Use the shared drive root folder ID from the config

  for (var i = 0; i < threads.length; i++) {
    var thread = threads[i];
    var messages = thread.getMessages();

    for (var j = 0; j < messages.length; j++) {
      var message = messages[j];
      var emailBody = message.getBody();
      var rawHtml = message.getRawContent();
      Logger.log("Processing message: " + message.getSubject());

      // Extract the document URL and requested emails from the email body
      var docUrl = extractDocUrlFromHtml(rawHtml);
      var requestedEmails = extractRequestedEmails(emailBody);
      Logger.log("Extracted document URL: " + docUrl);
      Logger.log("Extracted requested emails: " + requestedEmails.join(', '));

      if (docUrl && requestedEmails.length > 0) {
        var fileId = extractFileIdFromUrl(docUrl);
        Logger.log("Extracted file ID: " + fileId);
        var file = DriveApp.getFileById(fileId);

        // Enhanced check if the file is within the target shared drive
        if (isInRootDrive(file, rootDriveFolderId)) {
          Logger.log("File is within the root shared drive.");

          // Share the document with all extracted email addresses
          for (var k = 0; k < requestedEmails.length; k++) {
            file.addViewer(requestedEmails[k]);
          }
          Logger.log("Successfully shared the document.");

          // Log the time and emails for future revocation
          for (var k = 0; k < requestedEmails.length; k++) {
            PropertiesService.getScriptProperties().setProperty(fileId + '-' + requestedEmails[k], new Date().toISOString());
          }

          // Schedule the revocation (e.g., 24 hours later)
          ScriptApp.newTrigger('revokeAccess')
            .timeBased()
            .after(REVOKE_AFTER * 60 * 60 * 1000) // Use the revocation time from the config
            .create();
          Logger.log("Scheduled revocation trigger.");

          // Reply to the requester and notify all shared emails
          var replyMessage = REPLY_MESSAGE; // Use the reply message from the config
          for (var k = 0; k < requestedEmails.length; k++) {
            message.reply(replyMessage + "\n\nThis email has been sent to: " + requestedEmails[k]);
          }
          Logger.log("Sent reply to requester and all shared emails.");

          // Add the 'accessGranted' label and remove the 'accessRequested' label
          thread.addLabel(labelGranted);
          Logger.log("Added 'accessRequests/accessGranted' label to the thread.");
          thread.removeLabel(labelRequested);
          Logger.log("Removed 'accessRequests/accessRequested' label from the thread.");
        } else {
          Logger.log("File is not within the root shared drive.");
        }
      } else {
        Logger.log("Document URL or requested emails could not be extracted.");
      }
    }
  }
}

function extractDocUrlFromHtml(rawHtml) {
  // Find the first occurrence of a Google Drive link
  var urlRegex = /https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9_-]+/;
  var matches = rawHtml.match(urlRegex);
  return matches ? matches[0] : null;
}

function extractFileIdFromUrl(url) {
  var fileIdRegex = /\/d\/([a-zA-Z0-9_-]+)/;
  var matches = url.match(fileIdRegex);
  return matches ? matches[1] : null;
}

function extractRequestedEmails(body) {
  var emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g; // Use 'g' for global search
  var matches = body.match(emailRegex);
  return matches ? matches : []; // Return all matches or an empty array if no matches found
}

function isInRootDrive(file, rootDriveFolderId) {
  var currentFolder = file.getParents().next();
  Logger.log("Starting to check parent folders...");

  while (currentFolder) {
    var currentFolderId = currentFolder.getId().trim(); // Ensure IDs are trimmed of any whitespace
    var normalizedRootId = String(rootDriveFolderId).trim(); // Ensure root ID is also trimmed

    Logger.log("Checking folder: " + currentFolder.getName() + " (ID: " + currentFolderId + ")");
    
    // If we reach the root of the shared drive
    if (currentFolderId === normalizedRootId) {
      Logger.log("Reached root of the shared drive with ID: " + currentFolderId);
      return true;
    }
    
    // Move up to the next parent folder, or exit if there are no more parents
    if (currentFolder.getParents().hasNext()) {
      currentFolder = currentFolder.getParents().next();
    } else {
      Logger.log("Reached a folder with no more parents: " + currentFolder.getName() + " (ID: " + currentFolderId + ")");
      Logger.log(currentFolderId + " vs " + normalizedRootId + ": " + (currentFolderId === normalizedRootId));
      return currentFolderId === normalizedRootId;
    }
  }

  return false;
}

function revokeAccess() {
  var properties = PropertiesService.getScriptProperties().getProperties();
  var currentTime = new Date();

  for (var key in properties) {
    var details = key.split('-'); // fileId-email
    var fileId = details[0];
    var email = details[1];
    var timestamp = new Date(properties[key]);

    if ((currentTime - timestamp) >= REVOKE_AFTER * 60 * 60 * 1000) { // Use the revocation time from the config
      try {
        var file = DriveApp.getFileById(fileId);
        file.removeViewer(email);
        Logger.log("Access revoked for " + email + " to file " + fileId);
        PropertiesService.getScriptProperties().deleteProperty(key);
      } catch (e) {
        Logger.log("Error revoking access: " + e.message);
      }
    }
  }
}

function runHourly() {
  processAccessRequestsMain();
}

function createHourlyTrigger() {
  ScriptApp.newTrigger('runHourly')
    .timeBased()
    .everyHours(1)
    .create();
}
