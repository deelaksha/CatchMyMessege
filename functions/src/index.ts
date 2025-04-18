import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const deleteOldMessages = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
    const oneDayAgo = new admin.firestore.Timestamp(
      now.seconds - 24 * 60 * 60,
      now.nanoseconds
    );

    try {
      const messagesRef = db.collection('messages');
      const snapshot = await messagesRef
        .where('createdAt', '<', oneDayAgo)
        .get();

      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`Deleted ${snapshot.size} old messages`);
    } catch (error) {
      console.error('Error deleting old messages:', error);
    }
  }); 