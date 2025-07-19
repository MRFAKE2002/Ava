import axios from "axios";

const axiosAPIInstance = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Token a85d08400c622b50b18b61e239b9903645297196",
  },
  timeout: 10000,
});

export default axiosAPIInstance;
