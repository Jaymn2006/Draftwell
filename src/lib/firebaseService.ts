import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db, handleFirestoreError, OperationType } from './firebase'
import type { User as FirebaseUser } from 'firebase/auth'

export interface FirestoreNovel {
  id: string
  authorId: string
  authorName: string
  title: string
  synopsis: string
  genre: string
  status: 'Draft' | 'Ongoing' | 'Completed'
  coverColor?: string
  coverGradient?: string
  tags?: string[]
  reads?: number
  rating?: number
  updatedAt?: unknown
}

export interface FirestoreChapter {
  id: string
  novelId: string
  authorId: string
  chapterNumber: number
  title: string
  contentText: string
  wordCount: number
  status: string
  updatedAt?: unknown
}

export class FirebaseService {
  /**
   * Synchronize user profile into Firestore /users/{userId}
   */
  public async syncUserProfile(user: FirebaseUser, role: string = 'Author', uiPreferences?: Record<string, unknown>) {
    const path = `users/${user.uid}`
    try {
      const userRef = doc(db, 'users', user.uid)
      await setDoc(
        userRef,
        {
          id: user.uid,
          displayName: user.displayName || 'Anonymous Author',
          email: user.email || '',
          photoURL: user.photoURL || '',
          role,
          uiPreferences: uiPreferences || {},
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path)
    }
  }

  /**
   * Save a novel and its chapters to Firestore
   */
  public async saveNovel(novel: FirestoreNovel, chapters: FirestoreChapter[]) {
    const novelPath = `novels/${novel.id}`
    try {
      const novelRef = doc(db, 'novels', novel.id)
      await setDoc(
        novelRef,
        {
          ...novel,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, novelPath)
    }

    // Save chapters in subcollection
    for (const ch of chapters) {
      const chPath = `novels/${novel.id}/chapters/${ch.id}`
      try {
        const chRef = doc(db, 'novels', novel.id, 'chapters', ch.id)
        await setDoc(
          chRef,
          {
            ...ch,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        )
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, chPath)
      }
    }
  }

  /**
   * Fetch all novels belonging to the current author
   */
  public async getAuthorNovels(authorId: string): Promise<FirestoreNovel[]> {
    const path = 'novels'
    try {
      const q = query(collection(db, 'novels'), where('authorId', '==', authorId))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((d) => d.data() as FirestoreNovel)
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path)
    }
  }

  /**
   * Save a bookshelf entry to /users/{userId}/library/{novelId}
   */
  public async saveLibraryItem(userId: string, novelId: string, progress: number, completed: boolean = false) {
    const path = `users/${userId}/library/${novelId}`
    try {
      const ref = doc(db, 'users', userId, 'library', novelId)
      await setDoc(ref, {
        userId,
        novelId,
        progress,
        completed,
        lastReadAt: new Date().toISOString(),
      })
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path)
    }
  }

  /**
   * Fetch bookshelf items for the current user
   */
  public async getUserLibrary(userId: string) {
    const path = `users/${userId}/library`
    try {
      const snapshot = await getDocs(collection(db, 'users', userId, 'library'))
      return snapshot.docs.map((d) => d.data())
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, path)
    }
  }
}

export const firebaseService = new FirebaseService()
