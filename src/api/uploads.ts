import httpInstance from '@/utils/http';

export const uploadFileAPI = (formData: FormData) => {
    return httpInstance({
        url: '/uploads',
        method: 'POST',
        data: formData,
    });
};
