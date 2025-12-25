import httpInstance from '@/utils/http';

export const getCaptchaAPI = () => {
    return httpInstance({
        url: '/captcha',
        method: 'GET',
    });
};
