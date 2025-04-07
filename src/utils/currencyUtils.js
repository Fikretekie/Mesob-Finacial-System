// utils/currencyUtils.js
export const getUserCurrencyFromIP = async () => {
    try {
        const response = await fetch('https://ipapi.co/json');
        console.log('IP API response:', response);
        const data = await response.json();
        return data.currency; // e.g., "EUR", "INR", "GBP"
    } catch (error) {
        console.error('Error fetching currency:', error);
        return 'USD'; // fallback
    }
};