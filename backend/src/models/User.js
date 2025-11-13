import { db } from '../config/firebase.js';

const USERS_COLLECTION = 'users';

export class User {
  static async create(userData) {
    const { uid, email, type, name, surname, tel } = userData;
    
    const userDoc = {
      uid,
      email,
      type, // 'volunteer' or 'disabled'
      name,
      surname,
      tel,
      points: type === 'volunteer' ? 0 : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection(USERS_COLLECTION).doc(uid).set(userDoc);
    return userDoc;
  }

  static async getById(uid) {
    const userDoc = await db.collection(USERS_COLLECTION).doc(uid).get();
    if (!userDoc.exists) {
      return null;
    }
    return { id: userDoc.id, ...userDoc.data() };
  }

  static async getByEmail(email) {
    const snapshot = await db.collection(USERS_COLLECTION)
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  static async update(uid, updateData) {
    const updateDoc = {
      ...updateData,
      updatedAt: new Date(),
    };
    
    await db.collection(USERS_COLLECTION).doc(uid).update(updateDoc);
    return await this.getById(uid);
  }

  static async addPoints(uid, points) {
    const user = await this.getById(uid);
    if (!user || user.type !== 'volunteer') {
      throw new Error('User not found or not a volunteer');
    }
    
    const newPoints = (user.points || 0) + points;
    return await this.update(uid, { points: newPoints });
  }
}

