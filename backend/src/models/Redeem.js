import { db } from '../config/firebase.js';
import { User } from './User.js';

const REDEEMS_COLLECTION = 'redeems';

export class Redeem {
  static async create(redeemData) {
    const {
      volunteerId,
      rewardName,
      rewardDescription,
      pointsRequired,
    } = redeemData;

    // Check if user has enough points
    const user = await User.getById(volunteerId);
    if (!user || user.type !== 'volunteer') {
      throw new Error('User not found or not a volunteer');
    }

    if ((user.points || 0) < pointsRequired) {
      throw new Error('Insufficient points');
    }

    // Deduct points
    await User.addPoints(volunteerId, -pointsRequired);

    const redeemDoc = {
      volunteerId,
      rewardName,
      rewardDescription,
      pointsRequired,
      status: 'pending', // 'pending', 'approved', 'rejected', 'completed'
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection(REDEEMS_COLLECTION).add(redeemDoc);
    return { id: docRef.id, ...redeemDoc };
  }

  static async getById(redeemId) {
    const redeemDoc = await db.collection(REDEEMS_COLLECTION).doc(redeemId).get();
    if (!redeemDoc.exists) {
      return null;
    }
    return { id: redeemDoc.id, ...redeemDoc.data() };
  }

  static async getByVolunteerId(volunteerId) {
    const snapshot = await db.collection(REDEEMS_COLLECTION)
      .where('volunteerId', '==', volunteerId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async updateStatus(redeemId, status) {
    const updateData = {
      status,
      updatedAt: new Date(),
    };
    
    await db.collection(REDEEMS_COLLECTION).doc(redeemId).update(updateData);
    return await this.getById(redeemId);
  }
}

