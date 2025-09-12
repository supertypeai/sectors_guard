export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatNumber = (number) => {
  if (number === null || number === undefined) return '0';
  
  if (typeof number !== 'number') {
    const parsed = parseFloat(number);
    if (isNaN(parsed)) return '0';
    number = parsed;
  }
  
  return number.toLocaleString();
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    default:
      return 'default';
  }
};

export const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case 'success':
      return '✅';
    case 'warning':
      return '⚠️';
    case 'error':
      return '❌';
    default:
      return '❓';
  }
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
