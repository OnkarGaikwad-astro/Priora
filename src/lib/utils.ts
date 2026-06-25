import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDeadline(dateString: string) {
  if (!dateString) return null;
  
  const deadline = new Date(dateString);
  const now = new Date();
  
  // Calculate difference in days
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deadlineDay = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
  
  const diffTime = deadlineDay.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Time formatting
  const timeOpts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };
  const timeStr = deadline.toLocaleTimeString(undefined, timeOpts);
  
  let text = "";
  if (diffDays === 0) {
    text = `Today, ${timeStr}`;
  } else if (diffDays === 1) {
    text = `Tomorrow, ${timeStr}`;
  } else if (diffDays === -1) {
    text = `Yesterday, ${timeStr}`;
  } else {
    const dateOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    text = `${deadline.toLocaleDateString(undefined, dateOpts)}, ${timeStr}`;
  }

  const isOverdue = deadline.getTime() < now.getTime();
  // Urgent if it's due within 24 hours from now
  const isUrgent = !isOverdue && (deadline.getTime() - now.getTime() < 24 * 60 * 60 * 1000);

  return { text, isUrgent, isOverdue };
}
