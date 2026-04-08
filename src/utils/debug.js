export const debugStorage = () => {
  console.log('=== STORAGE DEBUG ===');
  console.log('localStorage user:', localStorage.getItem('user'));
  console.log('localStorage userData:', localStorage.getItem('userData'));
  console.log('sessionStorage user:', sessionStorage.getItem('user'));
  console.log('All localStorage keys:', Object.keys(localStorage));
  console.log('===================');
};

export const clearAllStorage = () => {
  localStorage.clear();
  sessionStorage.clear();
  console.log('All storage cleared');
  window.location.reload();
};