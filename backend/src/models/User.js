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

  // Check and add daily login bonus (50 points) if eligible
  // Resets at 6 AM Thailand time (UTC+7)
  static async checkDailyLoginBonus(uid) {
    try {
      const user = await this.getById(uid);
      if (!user || user.type !== 'volunteer') {
        return false; // Not eligible for bonus
      }

      // Get current time and convert to Thailand time (UTC+7)
      const now = new Date();
      // Get UTC time in milliseconds
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
      // Add 7 hours for Thailand time (UTC+7)
      const thailandOffset = 7 * 60 * 60 * 1000; // 7 hours in milliseconds
      const thailandTime = new Date(utcTime + thailandOffset);
      
      // Get today's date string in Thailand timezone (YYYY-MM-DD)
      const year = thailandTime.getUTCFullYear();
      const month = String(thailandTime.getUTCMonth() + 1).padStart(2, '0');
      const day = String(thailandTime.getUTCDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      
      // Get current hour in Thailand time
      const currentHour = thailandTime.getUTCHours();
      
      // Get last login date
      let lastLoginStr = null;
      if (user.lastLoginDate) {
        // Handle Firestore Timestamp
        let lastLoginDate;
        if (user.lastLoginDate.toDate) {
          lastLoginDate = user.lastLoginDate.toDate();
        } else if (user.lastLoginDate._seconds) {
          lastLoginDate = new Date(user.lastLoginDate._seconds * 1000);
        } else {
          lastLoginDate = new Date(user.lastLoginDate);
        }
        
        // Convert to Thailand timezone
        const lastLoginThailand = new Date(lastLoginDate.getTime() + thailandOffset);
        
        const lastYear = lastLoginThailand.getUTCFullYear();
        const lastMonth = String(lastLoginThailand.getUTCMonth() + 1).padStart(2, '0');
        const lastDay = String(lastLoginThailand.getUTCDate()).padStart(2, '0');
        lastLoginStr = `${lastYear}-${lastMonth}-${lastDay}`;
      }

      // Check if already logged in today
      if (lastLoginStr === todayStr) {
        return false; // Already got bonus today
      }

      // Check if it's past 6 AM Thailand time
      if (currentHour < 6) {
        return false; // Not yet 6 AM
      }

      // Add 50 points and update lastLoginDate
      await this.addPoints(uid, 50);
      
      // Update lastLoginDate to today (store as Date object)
      const todayDate = new Date();
      todayDate.setUTCHours(0, 0, 0, 0);
      await this.update(uid, { lastLoginDate: todayDate });

      return true; // Bonus added
    } catch (error) {
      console.error('[checkDailyLoginBonus] Error:', error);
      return false;
    }
  }
}

