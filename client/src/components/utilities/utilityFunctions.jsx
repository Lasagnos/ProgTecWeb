import { addDays, addWeeks, addMonths, addYears } from 'date-fns';

/* Utility to handle timezone offset */

// ISO string example: 2024-08-31T12:00:00.000Z
export const toLocalISOString = (date) => {
    const offset = date.getTimezoneOffset() * 60000; // Get the offset in milliseconds
    const adjustedDate = new Date(date.getTime() - offset); // Get the corrected date
    return adjustedDate.toISOString().slice(0, 16); // Return without seconds and milliseconds
};




/* Utility to get the nth occurrence of a specific weekday in a month */
const getNthWeekdayOfMonth = (date, nth, weekday) => {
  // Get the first day of the month in question
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1); 
  // Get the first wanted weekday of the month (adding the difference to the weekday of the 1st day)
  const firstWeekday = new Date(firstDayOfMonth.setDate(firstDayOfMonth.getDate() + ((7 + weekday - firstDayOfMonth.getDay()) % 7))); 
  // Get the nth occurrence of the weekday (adding the difference between to the first occurrence)
  const nthWeekday = new Date(firstWeekday.setDate(firstWeekday.getDate() + (nth - 1) * 7));  // nth - 1 because the first occurrence is the first weekday of the month
  // Fix the hour and minute of the date
  nthWeekday.setHours(date.getHours());
  nthWeekday.setMinutes(date.getMinutes());

  if (nthWeekday.getMonth() === date.getMonth()) {
    return nthWeekday;
  } else {
    // If nth weekday does not exist, return the last weekday of the month
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const lastWeekday = new Date(lastDayOfMonth.setDate(lastDayOfMonth.getDate() - ((lastDayOfMonth.getDay() + 7 - weekday) % 7)));
    lastWeekday.setHours(date.getHours());
    lastWeekday.setMinutes(date.getMinutes());
    return lastWeekday;
  }
};

// Utility to get the number of days in a month
const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();  // The '0th' day of the next month is the last day of the current month
};


/* Utility to expand recurring events */
export const expandRecurringEvents = (events, timeMachineDate) => {
  const expandedEvents = [];  // Array to store the occurrences

  events.forEach(event => {
    if (event.frequency === 'none') { // non-recurrings
      expandedEvents.push(event);
      return;
    }
    
    let currentOccurrence = new Date(event.start);
    const stopDate = event.stopDate ? new Date(event.stopDate) : null;
    const stopNumber = event.stopNumber ? event.stopNumber : null;
    let occurrenceCycleCount = 0;
    let lastOccurrenceEnd = null; // End date of the last occurrence

    const eventDuration = new Date(event.end) - new Date(event.start); // Duration of the event

    const originalDay = currentOccurrence.getDate();    // The intended day of the event
    const originalWeekday = currentOccurrence.getDay(); // The intended weekday
    const originalNthWeek = Math.ceil(originalDay / 7); // The intended week number

    let lastAvailableDayFlag = false;  // Flag to indicate that the last day of the month was reached. Used for monthly custom frequencies

    // Loop to expand the occurrences
    while (true) {
      let newEventEnd = new Date(currentOccurrence.getTime() + eventDuration);  // Set the end date based on the duration
      if (stopDate && newEventEnd > stopDate) { // If the event ends after the stop date...
        newEventEnd = stopDate; // ...truncate the occurrence's end date
      }

      // If an ocurrence overlaps, we extend the last one
      if (lastOccurrenceEnd && new Date(lastOccurrenceEnd) >= new Date(currentOccurrence)) {
        expandedEvents[expandedEvents.length - 1].end = newEventEnd;
      } else {
        const newEvent = {  //  Normal case: create a new occurrence
          ...event, 
          start: new Date(currentOccurrence), 
          end: newEventEnd,
          occurrenceCycleCount: occurrenceCycleCount  // Extra field to keep track of the occurrence number
        };
        expandedEvents.push(newEvent);
      }
      
      lastOccurrenceEnd = newEventEnd;  // Save the last event's end date

      // We prepare the next occurrence before the loop restarts
      // Move the date of the occurrence based on the frequency
      switch (event.frequency) {
        case 'daily':
          currentOccurrence = addDays(currentOccurrence, 1);
          occurrenceCycleCount++;
          break;
        case 'weekly':
          currentOccurrence = addWeeks(currentOccurrence, 1);
          occurrenceCycleCount++;
          break;
        case 'monthly':
          currentOccurrence = addMonths(currentOccurrence, 1);
          // Ensure the day is valid
          const daysInCurrentMonthM = getDaysInMonth(currentOccurrence.getMonth(), currentOccurrence.getFullYear());
          if (originalDay > daysInCurrentMonthM) { // Invalid day
            currentOccurrence.setDate(daysInCurrentMonthM); // Set to the last day of the month
          } else {
            currentOccurrence.setDate(originalDay); // Set to the intended day
          }
          occurrenceCycleCount++;
          break;
        case 'monthly_weekday':
          let tempOccurrence = addMonths(currentOccurrence, 1);
          // Get the nth occurrence of the original weekday in the month
          currentOccurrence = getNthWeekdayOfMonth(tempOccurrence, originalNthWeek, originalWeekday);
          occurrenceCycleCount++;
          break;
        case 'yearly':
          currentOccurrence = addYears(currentOccurrence, 1);
          // Ensure the day is valid
          const daysInCurrentMonthY = getDaysInMonth(currentOccurrence.getMonth(), currentOccurrence.getFullYear());
          if (originalDay > daysInCurrentMonthY) { // Invalid day
            currentOccurrence.setDate(daysInCurrentMonthY); // Set to the last day of the month
          } else {
            currentOccurrence.setDate(originalDay); // Set to the intended day
          }
          occurrenceCycleCount++;
          break;

        
        case 'custom':
          switch (event.customFrequency.type) {
            case 'daily':
              currentOccurrence = addDays(currentOccurrence, event.customFrequency.frequency);
              occurrenceCycleCount++;
              break;

            case 'weekly':
              const daysOfWeek = event.customFrequency.daysOfWeek;
              const currentDayOfWeek = currentOccurrence.getDay() === 0 ? 6 : currentOccurrence.getDay() - 1;  // Fix week order
              const nextDayOfWeek = daysOfWeek.find(day => day > currentDayOfWeek) || daysOfWeek[0];  // Get the next day of the week
              // Get the number of days to add by subtraction, or by adding the remaining days of the week
              const daysToAdd = (nextDayOfWeek > currentDayOfWeek) ? nextDayOfWeek - currentDayOfWeek : 7 - currentDayOfWeek + nextDayOfWeek;
              currentOccurrence = addDays(currentOccurrence, daysToAdd);
              // If it's a new week, add the remaining weeks
              if (nextDayOfWeek === daysOfWeek[0]) {
                currentOccurrence = addWeeks(currentOccurrence, event.customFrequency.frequency - 1);
                occurrenceCycleCount++;
              }
              
              break;

            case 'monthly':
              const daysOfMonth = event.customFrequency.daysOfMonth;
              const currentDayOfMonth = currentOccurrence.getDate();
              const nextDayOfMonth = lastAvailableDayFlag ?  daysOfMonth[0] : // If we reached the last day of the month on the last cycle, we move forward (avoids infinite loops)
                daysOfMonth.find(day => day > currentDayOfMonth) || daysOfMonth[0];
              // If it's a new month, add the frequencied months
              if (nextDayOfMonth === daysOfMonth[0]) {
                currentOccurrence = addMonths(currentOccurrence, event.customFrequency.frequency);
                lastAvailableDayFlag = false;  // Reset the flag once we move to the next month
                occurrenceCycleCount++;
              }
              
              const intendedMonth = currentOccurrence.getMonth();
              const daysInIntendedMonth = getDaysInMonth(intendedMonth, currentOccurrence.getFullYear());

              currentOccurrence.setDate(nextDayOfMonth);  // We move the occurrence to the next requested day
              // If we overflow to the next month...
              if (currentOccurrence.getMonth() !== intendedMonth) {
                currentOccurrence.setMonth(intendedMonth, daysInIntendedMonth);  // Set to the last day of the correct month
                lastAvailableDayFlag = true;  // Flag to indicate that the last day of the month was reached
                // if already in the list, the event is already there, so we skip the cycle
                if (daysInIntendedMonth in daysOfMonth) continue;
              }
              break;

            case 'monthly_weekday':
              let tempOccurrence = addMonths(currentOccurrence, event.customFrequency.frequency);
              const nthWeek = event.customFrequency.weekOfMonth.nthWeek;
              const nthWeekday = event.customFrequency.weekOfMonth.nthWeekday;
              // Get the nth occurrence requested 
              currentOccurrence = getNthWeekdayOfMonth(tempOccurrence, nthWeek, nthWeekday);
              occurrenceCycleCount++;
              break;

            case 'yearly':
              const monthsOfYear = event.customFrequency.monthsOfYear;
              const currentMonth = currentOccurrence.getMonth();
              const nextMonth = monthsOfYear.find(month => month > currentMonth) || monthsOfYear[0];
              // Get the number of months to add by subtraction, or by adding the remaining months of the year
              const monthsToAdd = (nextMonth > currentMonth) ? nextMonth - currentMonth : 12 - currentMonth + nextMonth;
              currentOccurrence = addMonths(currentOccurrence, monthsToAdd);
              // If it's a new year, add the remaining years
              if (nextMonth === monthsOfYear[0]) {
                currentOccurrence = addYears(currentOccurrence, event.customFrequency.frequency - 1);
                occurrenceCycleCount++;
              }
              
              // Ensure the day is valid
              const daysInCurrentMonthY = getDaysInMonth(currentOccurrence.getMonth(), currentOccurrence.getFullYear());
              if (originalDay > daysInCurrentMonthY) {
                currentOccurrence.setDate(daysInCurrentMonthY);
              } else {
                currentOccurrence.setDate(originalDay);
              }
              break;

            default:
              console.error('Unknown custom frequency type:', event.customFrequency.type);
              return;
          }
          break;

        default:
          console.error('Unknown frequency type:', event.frequency);
          return;
        }

        // Skip if the occurrence is after the time machine date + 10 years   // +1 day: .setDate(new Date(timeMachineDate).getDate() + 1)) break;
        if (new Date(currentOccurrence) > new Date(timeMachineDate).setFullYear(new Date(timeMachineDate).getFullYear() + 10)) break;
        if (stopDate && currentOccurrence > stopDate) break;  // Stop if the current occurrence is after the stop date
        if (stopNumber && occurrenceCycleCount >= stopNumber) break; // Stop if current occurence exceeds the stop number

    }
  });

  return expandedEvents;
};


// Quick util for rendering monthly_weekdays
const getOrdinalSuffix = (number) => {
  switch (number) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

/* Utility to render custom frequencies in the event info */
export const formatCustomFrequency = (customFrequency) => {
  const weekNames = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  const { type, frequency, daysOfWeek, daysOfMonth, weekOfMonth, monthsOfYear } = customFrequency;

  switch (type) {
    case 'daily':
      return frequency === 1 ? 'every day' : `every ${frequency} days`;

    case 'weekly':
      const days = daysOfWeek.map(day => weekNames[day]).join(', ');
      return frequency === 1 ? `every week on: ${days}` : `every ${frequency} weeks on: ${days}`;

    case 'monthly':
      if (daysOfMonth && daysOfMonth.length > 0) {
        const days = daysOfMonth.join(', ');
        return frequency === 1 ? `every month on: ${days}` : `every ${frequency} months on: ${days}`;
      }
      break;

    case 'monthly_weekday':
      if (weekOfMonth && weekOfMonth.nthWeek !== null && weekOfMonth.nthWeekday !== null) {
        const nthWeek = weekOfMonth.nthWeek === -1 ? 'last' : `${weekOfMonth.nthWeek}${getOrdinalSuffix(weekOfMonth.nthWeek)}`;
        const weekday = weekNames[weekOfMonth.nthWeekday === 0 ? 6 : weekOfMonth.nthWeekday - 1];  // Fix week order
        return frequency === 1 ? `every month on: ${nthWeek} ${weekday}` : `every ${frequency} months on: ${nthWeek} ${weekday}`;
      }
      break;

    case 'yearly':
      if (monthsOfYear && monthsOfYear.length > 0) {
        const months = monthsOfYear.map(month => monthNames[month]).join(', ');
        return frequency === 1 ? `every year on: ${months}` : `every ${frequency} years on: ${months}`;
      }
      break;

    default:
      return 'custom';
  }
};


/* Utilities for the notes page */

// Truncations
export const truncateContent = (content, maxLength) => {
  return content.length > maxLength ? `${content.substring(0, maxLength)}...` : content;
};
export const truncateCategories = (categories, maxLength) => {
  const categoriesText = categories.join(', ');
  return categoriesText.length > maxLength ? `${categoriesText.substring(0, maxLength)}...` : categoriesText;
};
// From ISO string to locale string
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

/* Utilities for the pomodoro timer */

// Utility function to convert seconds into 'XX minutes and XX seconds' format
export const formatTime = (timeInSeconds) => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.round(timeInSeconds % 60);
  // We use padStart to add a 0 if the seconds are less than 10
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};