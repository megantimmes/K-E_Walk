import { useState, useEffect, useCallback } from 'react'
import {
  doc, collection, onSnapshot, setDoc, updateDoc,
  serverTimestamp, addDoc, deleteDoc, getDocs,
} from 'firebase/firestore'
import { db, WALK_ID } from '../lib/firebase'
import { CHECKLIST } from '../data/checklist'
import { STOPS } from '../data/stops'

export function useWalkState() {
  const [walkDoc, setWalkDoc] = useState(null)
  const [stopStates, setStopStates] = useState({})
  const [checklistStates, setChecklistStates] = useState({})
  const [budgetEntries, setBudgetEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const walkRef = doc(db, 'walks', WALK_ID)
    const stopsRef = collection(db, 'walks', WALK_ID, 'stops')
    const checklistRef = collection(db, 'walks', WALK_ID, 'checklist')
    const budgetRef = collection(db, 'walks', WALK_ID, 'budget')

    const unsubs = []

    unsubs.push(onSnapshot(walkRef, (snap) => {
      setWalkDoc(snap.exists() ? snap.data() : { walkStartedAt: null, walkEndedAt: null, totalSpent: 0 })
      setLoading(false)
    }))

    unsubs.push(onSnapshot(stopsRef, (snap) => {
      const states = {}
      snap.forEach((d) => { states[d.id] = d.data() })
      setStopStates(states)
    }))

    unsubs.push(onSnapshot(checklistRef, (snap) => {
      const states = {}
      snap.forEach((d) => { states[d.id] = d.data() })
      setChecklistStates(states)
    }))

    unsubs.push(onSnapshot(budgetRef, (snap) => {
      const entries = []
      snap.forEach((d) => entries.push({ id: d.id, ...d.data() }))
      entries.sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0))
      setBudgetEntries(entries)
    }))

    return () => unsubs.forEach((u) => u())
  }, [])

  const startWalk = useCallback(async () => {
    await setDoc(doc(db, 'walks', WALK_ID), {
      walkStartedAt: serverTimestamp(),
      walkEndedAt: null,
      totalSpent: 0,
    }, { merge: true })
  }, [])

  const markStopArrived = useCallback(async (stopId, manual = false) => {
    await setDoc(doc(db, 'walks', WALK_ID, 'stops', String(stopId)), {
      arrived: true,
      arrivedAt: serverTimestamp(),
      skipped: false,
      manualOverride: manual,
    })
  }, [])

  const undoStopArrival = useCallback(async (stopId) => {
    await setDoc(doc(db, 'walks', WALK_ID, 'stops', String(stopId)), {
      arrived: false,
      arrivedAt: null,
      skipped: false,
      manualOverride: false,
    })
  }, [])

  const restartWalk = useCallback(async () => {
    const stopsRef = collection(db, 'walks', WALK_ID, 'stops')
    const checklistRef = collection(db, 'walks', WALK_ID, 'checklist')
    const [stopsSnap, checklistSnap] = await Promise.all([getDocs(stopsRef), getDocs(checklistRef)])
    await Promise.all([
      ...stopsSnap.docs.map((d) => deleteDoc(d.ref)),
      ...checklistSnap.docs.map((d) => deleteDoc(d.ref)),
    ])
    await setDoc(doc(db, 'walks', WALK_ID), {
      walkStartedAt: null,
      walkEndedAt: null,
      totalSpent: 0,
    })
  }, [])

  const skipStop = useCallback(async (stopId) => {
    await setDoc(doc(db, 'walks', WALK_ID, 'stops', String(stopId)), {
      arrived: false,
      arrivedAt: null,
      skipped: true,
      manualOverride: false,
    })
  }, [])

  const toggleChecklist = useCallback(async (itemId, currentValue) => {
    await setDoc(doc(db, 'walks', WALK_ID, 'checklist', itemId), {
      checked: !currentValue,
    })
  }, [])

  const addBudgetEntry = useCallback(async (label, amountCents) => {
    await addDoc(collection(db, 'walks', WALK_ID, 'budget'), {
      label,
      amount: amountCents,
      createdAt: serverTimestamp(),
    })
  }, [])

  const deleteBudgetEntry = useCallback(async (entryId) => {
    await deleteDoc(doc(db, 'walks', WALK_ID, 'budget', entryId))
  }, [])

  const completedStopIds = new Set(
    Object.entries(stopStates)
      .filter(([, s]) => s.arrived || s.skipped)
      .map(([id]) => Number(id))
  )

  const arrivedStopIds = new Set(
    Object.entries(stopStates)
      .filter(([, s]) => s.arrived)
      .map(([id]) => Number(id))
  )

  const nextStop = STOPS.find((s) => !completedStopIds.has(s.id)) ?? null

  const checkedCount = CHECKLIST.filter(
    (item) => checklistStates[item.id]?.checked
  ).length

  const totalSpentCents = budgetEntries.reduce((sum, e) => sum + (e.amount ?? 0), 0)

  return {
    walkDoc,
    stopStates,
    checklistStates,
    budgetEntries,
    loading,
    completedStopIds,
    arrivedStopIds,
    nextStop,
    checkedCount,
    totalSpentCents,
    startWalk,
    restartWalk,
    markStopArrived,
    undoStopArrival,
    skipStop,
    toggleChecklist,
    addBudgetEntry,
    deleteBudgetEntry,
  }
}
