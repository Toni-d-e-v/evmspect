import axios from 'axios';

let ETHERSCAN_API_KEY = 'YAWP8ZXZBG8YWBFW2T7TSFRFIT41D8FHEE'; // Replace with your Etherscan API key
let ETHERSCAN_API_BASE_URL = 'https://api.etherscan.io/api';

export const getTransactionHistory = async (address: string, custom_api_key?: string, custom_api_url?: string) => {
  if (custom_api_key) {
    ETHERSCAN_API_KEY = custom_api_key;
  }
  if (custom_api_url) {
    ETHERSCAN_API_BASE_URL = custom_api_url;
  }
  try {
    const response = await axios.get(
      `${ETHERSCAN_API_BASE_URL}?module=account&action=txlist&address=${address}&apikey=${ETHERSCAN_API_KEY}`
    );
    if (response.data.status === '0') {
      throw new Error(response.data.result);
    }
    return response.data.result;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return [];
  }
};
