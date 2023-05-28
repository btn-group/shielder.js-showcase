export const useLocalStorage = () => {
  const getLocalStorageValue = (key: string): any => {
    try {
      const item = window.localStorage.getItem(key) as string;
      return JSON.parse(item);
    } catch (error) {
      console.log(error);
    }
  };

  const setLocalStorageValue = (key: string, value: any) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log(error);
    }
  };

  return { getLocalStorageValue, setLocalStorageValue };
};
