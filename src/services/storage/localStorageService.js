const localStorageService = {
  setToken: tokenObj => {
    localStorage.setItem("access_token", tokenObj.access_token);
    localStorage.setItem("refresh_token", tokenObj.refresh_token);
  },
  getAccessToken: () => {
    return localStorage.getItem("access_token");
  },
  getRefreshToken: () => {
    return localStorage.getItem("refresh_token");
  },
  clearToken: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
  setItem: (key, obj) => {
    console.log(typeof key);
    if (typeof key === "string") localStorage.setItem(key, obj);
  },
  getItem: key => {
    if (typeof key === "string") return localStorage.getItem(key);
  },
  delete: key => {
    if (typeof key === "string") return localStorage.removeItem(key);
  }
};

export default localStorageService;
