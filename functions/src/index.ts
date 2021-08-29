import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const auth = admin.auth();
const db = admin.firestore;

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
      }

      functions.logger.log("Updating summary", context.params.votesId, fields);
      return await db().collection("votes").doc("summary").set({
        ...fields,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      }, {
        merge: true,
      });
    });

// Add the users to the summary.
exports.addUsers = functions.auth.user().onCreate(() => {
  db().collection("votes").doc("summary").set({
    users: admin.firestore.FieldValue.increment(1),
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  }, {
    merge: true,
  });
});

// Remove the users from the summary.
exports.removeUsers = functions.auth.user().onDelete(() => {
  db().collection("votes").doc("summary").set({
    users: admin.firestore.FieldValue.increment(-1),
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  }, {
    merge: true,
  });
});
