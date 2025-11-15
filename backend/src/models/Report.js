import { db } from '../config/firebase.js';

const REPORTS_COLLECTION = 'reports';

export class Report {
  static async create(reportData) {
    const {
      userId,
      type, // 'normal' or 'sos'
      details,
      location,
      latitude,
      longitude,
      status = 'pending', // 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'
    } = reportData;

    const reportDoc = {
      userId,
      type,
      details,
      location: location || '',
      latitude,
      longitude,
      status,
      priority: type === 'sos' ? 'high' : 'medium',
      assignedVolunteerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection(REPORTS_COLLECTION).add(reportDoc);
    return { id: docRef.id, ...reportDoc };
  }

  static async getById(reportId) {
    const reportDoc = await db.collection(REPORTS_COLLECTION).doc(reportId).get();
    if (!reportDoc.exists) {
      return null;
    }
    return { id: reportDoc.id, ...reportDoc.data() };
  }

  static async getByUserId(userId, status = null) {
    let query = db.collection(REPORTS_COLLECTION).where('userId', '==', userId);
    
    if (status) {
      // When filtering by status, we need a composite index
      // For now, fetch all and filter in memory if needed
      query = query.where('status', '==', status);
    }
    
    // Always order by createdAt - requires index: userId (ASC) + createdAt (DESC)
    // Or if status filter: userId (ASC) + status (ASC) + createdAt (DESC)
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async getAvailableCases(volunteerId = null) {
    let query = db.collection(REPORTS_COLLECTION)
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc');
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async assignVolunteer(reportId, volunteerId) {
    const updateData = {
      assignedVolunteerId: volunteerId,
      status: 'in_progress',
      updatedAt: new Date(),
    };
    
    await db.collection(REPORTS_COLLECTION).doc(reportId).update(updateData);
    return await this.getById(reportId);
  }

  static async updateStatus(reportId, status) {
    const updateData = {
      status,
      updatedAt: new Date(),
    };
    
    await db.collection(REPORTS_COLLECTION).doc(reportId).update(updateData);
    return await this.getById(reportId);
  }

  static async getByVolunteerId(volunteerId) {
    const snapshot = await db.collection(REPORTS_COLLECTION)
      .where('assignedVolunteerId', '==', volunteerId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

