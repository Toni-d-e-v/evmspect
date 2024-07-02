import axios from 'axios';

let ETHERSCAN_API_KEY = 'YAWP8ZXZBG8YWBFW2T7TSFRFIT41D8FHEE'; // Replace with your Etherscan API key
let ETHERSCAN_API_BASE_URL = 'https://api.etherscan.io/api';

export const getTransactionHistory1 = async (address: string, custom_api_key?: string, custom_api_url?: string) => {
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


export const getTransactionHistory = async (address: string, custom_api_key?: string, custom_api_url?: string) => {
  if (custom_api_key) {
    ETHERSCAN_API_KEY = custom_api_key;
  }
  if (custom_api_url) {
    ETHERSCAN_API_BASE_URL = custom_api_url;
  }

  try {
    const [ethTxResponse, erc20TxResponse, erc721TxResponse] = await Promise.all([
      axios.get(`${ETHERSCAN_API_BASE_URL}?module=account&action=txlist&address=${address}&apikey=${ETHERSCAN_API_KEY}`),
      axios.get(`${ETHERSCAN_API_BASE_URL}?module=account&action=tokentx&address=${address}&apikey=${ETHERSCAN_API_KEY}`),
      axios.get(`${ETHERSCAN_API_BASE_URL}?module=account&action=tokennfttx&address=${address}&apikey=${ETHERSCAN_API_KEY}`)
    ]);

    if (ethTxResponse.data.status === '0') {
      throw new Error(ethTxResponse.data.result);
    }
    if (erc20TxResponse.data.status === '0') {
      throw new Error(erc20TxResponse.data.result);
    }


    return {
      ethTransactions: ethTxResponse.data.result,
      erc20Transactions: erc20TxResponse.data.result,
    };
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return {
      ethTransactions: [],
      erc20Transactions: [],
    };
  }
};