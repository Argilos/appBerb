export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

export const parseDate = (dateString) => {
  if (!dateString) return '';
  try {
    const [day, month, year] = dateString.split('.');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error parsing date:', error);
    return dateString;
  }
};
