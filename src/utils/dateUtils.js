export const formatDate = (date) => {
  if (!date) return '';
  
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date));
};

export const formatXRechnungDate = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
}; 