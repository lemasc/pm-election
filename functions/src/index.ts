import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {google} from "googleapis";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require("../serviceAccount.json");

admin.initializeApp();
const auth = admin.auth();
const db = admin.firestore;

const jwtClient = new google.auth.JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

/**
 * Logs the action to Google Sheets
 * @param {string[]} log data to add
 */
async function log(...data: Array<string|null>) {
  const sheets = google.sheets("v4");
  await jwtClient.authorize();
  await sheets.spreadsheets.values.append(
      {
        auth: jwtClient,
        spreadsheetId: "14ZDJWZuKAw92JlFNvGr6f6BjJmOCMs-HqlDD7h0UrUA",
        range: "Log!A2",
        valueInputOption: "RAW",
        requestBody: {values: [data]},
      },
      {}
  );
}
// Updates the summary when votes are added, edited, or delete.
// The summary will then used by dashboard.
exports.updateSummary = functions.firestore.document("/votes/{userId}")
    .onWrite(async (change, context) => {
      const uid = context.params.userId;
      if (uid === "summary") return;
      // Get an object with the current document value.
      // If the document does not exist, it has been deleted.
      const document = change.after.exists ? change.after.data() : undefined;

      // Get an object with the previous document value (for update or delete)
      const oldDocument = change.before.data();
      let fields = {};
      if (oldDocument && document &&
        oldDocument.selected === document.selected) return;

      const user = await auth.getUser(uid);
      if (oldDocument) {
        fields = {
          ...fields,
          [oldDocument.selected]: oldDocument[oldDocument.selected] &&
          oldDocument[oldDocument.selected] > 0 ?
          db.FieldValue.increment(-1) : 0,
        };
        if (!document) {
          await auth.setCustomUserClaims(uid, {
            ...user.customClaims,
            voted: undefined,
          });
          await log(context.timestamp, oldDocument.stdID, "DESELECTED",
              `${oldDocument.name} (${oldDocument.selected})`, null,
              oldDocument.ip, oldDocument.useragent
          );
        }
      }
      functions.logger.log("Document", document);
      if (document) {
        fields = {
          ...fields,
          [document.selected]: db.FieldValue.increment(1),
        };
        await auth.setCustomUserClaims(uid, {
          ...user.customClaims,
          voted: document.selected,
        });
        await log(context.timestamp, document.stdID,
          oldDocument ? "EDIT" : "SELECTED",
          oldDocument ? `${oldDocument.name} (${oldDocument.selected})` : null,
          `${document.name} (${document.selected})`, document.ip,
          document.useragent
        );
      }

      functions.logger.log("Updating summary", context.params.votesId, fields);
      return db().collection("votes").doc("summary").set({
        ...fields,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      }, {
        merge: true,
      });
    });

// Add the users to the summary.
exports.addUsers = functions.auth.user().onCreate(async (user, context) => {
  await log(context.timestamp, (user.email as string).slice(3, 8),
      "USER_ADD", null, user?.displayName as string);
  return db().collection("votes").doc("summary").set({
    users: admin.firestore.FieldValue.increment(1),
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  }, {
    merge: true,
  });
});

// Remove the users from the summary.
exports.removeUsers = functions.auth.user().onDelete(async (user, context) => {
  await log(context.timestamp, (user.email as string).slice(3, 8),
      "USER_REMOVE", user?.displayName as string);
  return db().collection("votes").doc("summary").set({
    users: admin.firestore.FieldValue.increment(-1),
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  }, {
    merge: true,
  });
});
