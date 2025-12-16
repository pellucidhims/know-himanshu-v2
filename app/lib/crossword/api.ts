/**
 * Crossword API Client
 * Fetches puzzle data from the server
 */

import { api } from '../api'

// Types for crossword data from server
export interface CrosswordCell {
  isBlocked: boolean
  number: number | null
  acrossNumber: number | null
  downNumber: number | null
  isPartOfAcross: boolean
  isPartOfDown: boolean
}

export interface WordHash {
  number: number
  direction: 'across' | 'down'
  hash: string
  length: number
  startRow: number
  startCol: number
}

export interface Clue {
  number: number
  clue: string
}

export interface CrosswordPuzzleData {
  grid: CrosswordCell[][]
  acrossClues: Clue[]
  downClues: Clue[]
  wordHashes: WordHash[]
  gridSize: number
  dateGenerated: string
}

export interface VerifyResult {
  number: number
  direction: 'across' | 'down'
  correct: boolean
}

export interface VerifyResponse {
  results: VerifyResult[]
  allCorrect: boolean
  correctCount: number
  totalCount: number
  puzzleDate: string
}

/**
 * Fetch the daily crossword puzzle from the server
 */
export async function fetchDailyPuzzle(): Promise<CrosswordPuzzleData> {
  try {
    const response = await api.get('/crossword/puzzle')
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch puzzle')
    }
    
    return response.data.data
  } catch (error) {
    console.error('Error fetching crossword puzzle:', error)
    throw error
  }
}

/**
 * Verify answers on the server (optional - can also verify locally)
 */
export async function verifyAnswersOnServer(
  answers: { word: string; number: number; direction: 'across' | 'down' }[],
  puzzleDate: string
): Promise<VerifyResponse> {
  try {
    const response = await api.post('/crossword/verify', {
      answers,
      puzzleDate,
    })
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to verify answers')
    }
    
    return response.data.data
  } catch (error) {
    console.error('Error verifying crossword answers:', error)
    throw error
  }
}

/**
 * Get puzzle info (metadata only)
 */
export async function getPuzzleInfo(): Promise<{
  dateGenerated: string
  gridSize: number
  wordCount: number
  acrossCount: number
  downCount: number
}> {
  try {
    const response = await api.get('/crossword/info')
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch puzzle info')
    }
    
    return response.data.data
  } catch (error) {
    console.error('Error fetching puzzle info:', error)
    throw error
  }
}

