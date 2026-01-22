import axiosInstance from "./axios";

export async function uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);

    const res = await axiosInstance.post("/uploads/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data; // { success: true, url: ... }
}
