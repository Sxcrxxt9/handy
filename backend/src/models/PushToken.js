import { db } from '../config/firebase.js';

const TOKENS_COLLECTION = 'pushTokens';
const MAX_IN_QUERY = 10;

const chunkArray = (items, size) => {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

export class PushToken {
  static async save({ userId, token, platform = 'unknown', userType = 'unknown' }) {
    if (!token) {
      throw new Error('Token is required');
    }

    const ref = db.collection(TOKENS_COLLECTION).doc(token);
    const doc = await ref.get();
    const now = new Date();

    const data = {
      userId,
      token,
      platform,
      userType,
      updatedAt: now,
      lastActiveAt: now,
    };

    if (!doc.exists) {
      data.createdAt = now;
    }

    await ref.set(data, { merge: true });
    return { id: ref.id, ...data };
  }

  static async remove(token) {
    if (!token) {
      return;
    }

    await db.collection(TOKENS_COLLECTION).doc(token).delete();
  }

  static async getTokensByUserType(userTypes) {
    const types = Array.isArray(userTypes) ? userTypes : [userTypes];
    if (!types.length) {
      return [];
    }

    const snapshots = await Promise.all(
      chunkArray(types, MAX_IN_QUERY).map((chunk) =>
        db.collection(TOKENS_COLLECTION).where('userType', 'in', chunk).get()
      )
    );

    const tokens = new Map();
    snapshots.forEach((snapshot) => {
      snapshot.docs.forEach((doc) => {
        tokens.set(doc.id, { id: doc.id, ...doc.data() });
      });
    });

    return Array.from(tokens.values());
  }

  static async getTokensByUserIds(userIds) {
    const ids = Array.isArray(userIds) ? userIds : [userIds];
    if (!ids.length) {
      return [];
    }

    const snapshots = await Promise.all(
      chunkArray(ids, MAX_IN_QUERY).map((chunk) =>
        db.collection(TOKENS_COLLECTION).where('userId', 'in', chunk).get()
      )
    );

    const tokens = new Map();
    snapshots.forEach((snapshot) => {
      snapshot.docs.forEach((doc) => {
        tokens.set(doc.id, { id: doc.id, ...doc.data() });
      });
    });

    return Array.from(tokens.values());
  }
}

