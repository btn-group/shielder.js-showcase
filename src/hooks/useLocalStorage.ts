export const useLocalStorage = () => {
  const addToDeposits = (depositWASMJSON: any): any => {
      const depositsJSONLS = getLocalStorageValue("deposits");
      const depositsArr = depositsJSONLS ? JSON.parse(depositsJSONLS) : [];
      depositsArr.push(depositWASMJSON);
      setLocalStorageValue("deposits", JSON.stringify(depositsArr));
  };

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

  return { addToDeposits, getLocalStorageValue, setLocalStorageValue };
};
