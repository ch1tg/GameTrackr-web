import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:80",
    withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
    const csrfToken = getCookie("csrf_access_token");
    if (csrfToken) {
        config.headers["X-CSRF-TOKEN"] = csrfToken;
    }
    return config;
});

function getCookie(name: string) {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? match[2] : null;
}

export default apiClient;