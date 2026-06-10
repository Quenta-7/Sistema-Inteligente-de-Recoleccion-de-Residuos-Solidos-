export const initTheme = (): 'light' | 'dark' => {
  const theme = localStorage.getItem('color-theme') || 'light';
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  return theme as 'light' | 'dark';
};

export const toggleTheme = (currentTheme: 'light' | 'dark'): 'light' | 'dark' => {
  const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
  if (nextTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('color-theme', nextTheme);
  return nextTheme;
};
