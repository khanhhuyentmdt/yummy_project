/**
 * Time utility functions for handling AM/PM format and calculations
 */

/**
 * Parse time string with AM/PM format to 24-hour format
 * Examples:
 *   "08:00 SA" -> "08:00"
 *   "05:30 CH" -> "17:30"
 *   "12:00 SA" -> "00:00"
 *   "12:00 CH" -> "12:00"
 */
export function parseTimeWithAMPM(timeStr) {
  if (!timeStr) return ''
  
  // Remove extra spaces and convert to uppercase
  const cleaned = timeStr.trim().toUpperCase()
  
  // Check if it has AM/PM (SA/CH) format
  const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(SA|CH|AM|PM)$/)
  if (!match) {
    // Already in 24-hour format or invalid
    return timeStr.includes(':') ? timeStr.split(' ')[0] : timeStr
  }
  
  let hours = parseInt(match[1], 10)
  const minutes = match[2]
  const period = match[3]
  
  // Convert to 24-hour format
  if (period === 'SA' || period === 'AM') {
    // SA (Sáng - Morning)
    if (hours === 12) hours = 0 // 12 SA = 00:00
  } else {
    // CH (Chiều - Afternoon/Evening)
    if (hours !== 12) hours += 12 // Add 12 except for 12 CH
  }
  
  return `${String(hours).padStart(2, '0')}:${minutes}`
}

/**
 * Convert 24-hour format to AM/PM format
 * Examples:
 *   "08:00" -> "08:00 SA"
 *   "17:30" -> "05:30 CH"
 *   "00:00" -> "12:00 SA"
 *   "12:00" -> "12:00 CH"
 */
export function formatTimeWithAMPM(time24) {
  if (!time24) return ''
  
  const [hoursStr, minutes] = time24.split(':')
  let hours = parseInt(hoursStr, 10)
  
  let period = 'SA' // Default to morning
  let displayHours = hours
  
  if (hours === 0) {
    // 00:00 -> 12:00 SA
    displayHours = 12
    period = 'SA'
  } else if (hours < 12) {
    // 01:00 - 11:59 -> SA
    period = 'SA'
  } else if (hours === 12) {
    // 12:00 -> 12:00 CH
    period = 'CH'
  } else {
    // 13:00 - 23:59 -> CH
    displayHours = hours - 12
    period = 'CH'
  }
  
  return `${String(displayHours).padStart(2, '0')}:${minutes} ${period}`
}

/**
 * Convert time string to minutes since midnight
 * Handles both 24-hour and AM/PM formats
 */
export function timeToMinutes(timeStr) {
  if (!timeStr) return 0
  
  // Parse AM/PM format first if present
  const time24 = parseTimeWithAMPM(timeStr)
  
  const [hoursStr, minutesStr] = time24.split(':')
  const hours = parseInt(hoursStr, 10) || 0
  const minutes = parseInt(minutesStr, 10) || 0
  
  return hours * 60 + minutes
}

/**
 * Convert minutes to display format "X giờ Y phút"
 */
export function minutesToDisplay(totalMinutes) {
  if (totalMinutes < 0) return '0 giờ'
  
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  if (minutes === 0) {
    return `${hours} giờ`
  }
  return `${hours} giờ ${minutes} phút`
}

/**
 * Calculate total working hours
 * Formula: (end_time - start_time) - total_break_time
 */
export function calculateWorkingHours(startTime, endTime, breaks = []) {
  if (!startTime || !endTime) return 0
  
  let startMins = timeToMinutes(startTime)
  let endMins = timeToMinutes(endTime)
  
  // Handle overnight shift (e.g., 22:00 to 06:00)
  if (endMins <= startMins) {
    endMins += 24 * 60 // Add 24 hours
  }
  
  // Calculate work duration
  let workMins = endMins - startMins
  
  // Subtract break times
  for (const brk of breaks) {
    if (!brk.break_start || !brk.break_end) continue
    
    let breakStartMins = timeToMinutes(brk.break_start)
    let breakEndMins = timeToMinutes(brk.break_end)
    
    // Handle overnight break
    if (breakEndMins <= breakStartMins) {
      breakEndMins += 24 * 60
    }
    
    workMins -= (breakEndMins - breakStartMins)
  }
  
  return Math.max(0, workMins)
}

/**
 * Calculate and format working hours for display
 */
export function calculateWorkingHoursDisplay(startTime, endTime, breaks = []) {
  const totalMinutes = calculateWorkingHours(startTime, endTime, breaks)
  return minutesToDisplay(totalMinutes)
}
