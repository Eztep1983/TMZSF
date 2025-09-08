// components/auth/AuthProvider.tsx
'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  GoogleAuthProvider 
} from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {}
})

export const useAuth = () => {
  return useContext(AuthContext)
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const createUserDocument = async (user: User) => {
    try {
      console.log('📝 Creating/updating document for user:', user.uid)
      const userRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userRef)
      
      if (!userDoc.exists()) {
        console.log('👤 Creating new user document')
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date(),
          lastLogin: new Date(),
          role: 'user',
          businessId: user.uid
        })
      } else {
        console.log('🔄 Updating existing user document')
        await setDoc(userRef, {
          lastLogin: new Date()
        }, { merge: true })
      }
    } catch (error) {
      console.error('❌ Error creating user document:', error)
    }
  }

  const signInWithGoogle = async () => {
    try {
      console.log('🔐 Starting Google sign in...')
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({
        prompt: 'select_account'
      })
      
      const result = await signInWithPopup(auth, provider)
      console.log('✅ Google sign in successful:', result.user.uid)
      await createUserDocument(result.user)
    } catch (error) {
      console.error('❌ Error signing in with Google:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      console.log('🚪 Logging out...')
      await signOut(auth)
    } catch (error) {
      console.error('❌ Error signing out:', error)
      throw error
    }
  }

  // ÚNICO useEffect para manejar el estado de autenticación
  useEffect(() => {
    console.log('🔄 AuthProvider initialized - setting up auth listener')
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔥 Auth state changed:', user ? `User: ${user.uid}` : 'No user')
      
      if (user) {
        await createUserDocument(user)
      }
      
      setUser(user)
      setLoading(false)
      
      console.log('✅ Auth state processed, loading:', false)
    })

    return () => {
      console.log('🧹 AuthProvider cleanup')
      unsubscribe()
    }
  }, [])

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}