import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Updates the summary when votes are added, edited, or delete.
// The summary will then used by dashboard
exports.updateSummary = functions.firestore.document("/votes/{votesId}")
    .onWrite((change, context) => {
      if (context.params.votesId === "summary") return;
      // Get an object with the current document value.
      // If the document does not exist, it has been deleted.
      const document = change.after.exists ? change.after.data() : undefined;

      // Get an object with the previous document value (for update or delete)
      const oldDocument = change.before.data();
      let fields = {};
      if (oldDocument && document &&
        oldDocument.selected === document.selected) return;
      if (oldDocument) {
        fields = {
          ...fields,
          [oldDocument.selected]: oldDocument[oldDocument.selected] &&
          oldDocument[oldDocument.selected] > 0 ?
          admin.firestore.FieldValue.increment(-1) : 0,
        };
      }
      functions.logger.log("Document", document);
      if (document) {
        fields = {
          ...fields,
          [document.selected]: admin.firestore.FieldValue.increment(1),
        };
      }

      functions.logger.log("Updating summary", context.params.votesId, fields);
      db.collection("votes").doc("summary").set({
        ...fields,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      }, {
        merge: true,
      });
    });

