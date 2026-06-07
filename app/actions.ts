"use server"

import { neon } from "@neondatabase/serverless"

type SaveResult =
  | { success: true; saved: true }
  | { success: true; saved: false; reason: string }
  | { success: false; error: string }

export async function saveGameSession(data: {
  name: string
  duration: number
  wpm: number
  accuracy: number
  errors: number
}): Promise<SaveResult> {
  if (!process.env.DATABASE_URL) {
    return { success: false, error: "Database not configured" }
  }

  const trimmedName = data.name.trim()

  if (!trimmedName) {
    return { success: false, error: "Name is required" }
  }

  if (trimmedName.length < 2) {
    return { success: false, error: "Nickname must be at least 2 characters" }
  }

  // Validate stats are reasonable numbers
  if (data.wpm < 0 || data.accuracy < 0 || data.accuracy > 100 || data.errors < 0) {
    return { success: false, error: "Invalid game stats" }
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    const existingSessions = await sql`
      SELECT id, wpm, accuracy, errors 
      FROM game_sessions 
      WHERE name = ${trimmedName}
      ORDER BY wpm DESC, accuracy DESC, errors ASC
      LIMIT 1
    `

    if (existingSessions.length > 0) {
      const existing = existingSessions[0]

      const isBetter =
        data.wpm > existing.wpm ||
        (data.wpm === existing.wpm && data.accuracy > existing.accuracy) ||
        (data.wpm === existing.wpm &&
          data.accuracy === existing.accuracy &&
          data.errors < existing.errors)

      if (isBetter) {
        await sql`
          UPDATE game_sessions 
          SET 
            duration = ${data.duration}, 
            wpm = ${data.wpm}, 
            accuracy = ${data.accuracy}, 
            errors = ${data.errors},
            created_at = CURRENT_TIMESTAMP
          WHERE id = ${existing.id}
        `
        return { success: true, saved: true }
      } else {
        // FIX: Was returning success:true even when not saving — misleading the UI
        return {
          success: true,
          saved: false,
          reason: `Your best score is already ${existing.wpm} WPM — keep practicing to beat it!`,
        }
      }
    } else {
      await sql`
        INSERT INTO game_sessions (name, duration, wpm, accuracy, errors)
        VALUES (${trimmedName}, ${data.duration}, ${data.wpm}, ${data.accuracy}, ${data.errors})
      `
      return { success: true, saved: true }
    }
  } catch (error) {
    console.error("Failed to save game session:", error)
    return { success: false, error: "Failed to save game session. Please try again." }
  }
}

export async function getLeaderboard() {
  if (!process.env.DATABASE_URL) {
    return []
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    const leaderboard = await sql`
      SELECT name, wpm, accuracy
      FROM game_sessions
      ORDER BY wpm DESC, accuracy DESC, errors ASC
      LIMIT 15
    `
    return leaderboard as { name: string; wpm: number; accuracy: number }[]
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error)
    return []
  }
}