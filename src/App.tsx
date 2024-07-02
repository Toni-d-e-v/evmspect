import React, { useState, useEffect } from 'react';
import AddressForm from './components/AddressForm';
import TransactionHistory from './components/TransactionHistory';
import { getTransactionHistory } from './api/etherscan';
import Navbar from './components/Navbar';

const App: React.FC = () => {

  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<any>({ ethTransactions: [], erc20Transactions: [] });
  const [ourAddress, setOurAddress] = useState<string>('');
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [customCheck, setCustomCheck] = useState<boolean>(true);
  const [explorerUrl, setExplorerUrl] = useState<string>('');
  const [selectedTransactionType, setSelectedTransactionType] = useState<string>('ethTransactions');

  const handleAddressSearch = async (address: string) => {
    const txHistory = await getTransactionHistory(address, customApiKey, customUrl);
    setOurAddress(address);
    setTransactions(txHistory);
  };

  const saveCustomData = () => {
    if (localStorage.getItem('customData') === null) {
      localStorage.setItem('customData', JSON.stringify([]));
    }
    const customData = JSON.parse(localStorage.getItem('customData') || '[]');
    customData.push({
      customApiKey: customApiKey,
      customUrl: customUrl,
      explorerUrl: explorerUrl
    });
    localStorage.setItem('customData', JSON.stringify(customData));
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const address = urlParams.get('address');
    if (address && address !== ourAddress) {
      handleAddressSearch(address);
    }
  }, [ourAddress]);

  return (
    <div>
      <Navbar />  
      <div>
        {customCheck === false ? 
          <div className="custom">
            Use custom apikey and url for any EVM network, e.g. BSC, Polygon, etc. like <a href="https://bscscan.com/" target="_blank" rel="noopener noreferrer">BSCScan</a> or <a href="https://polygonscan.com/" target="_blank" rel="noopener noreferrer">PolygonScan</a>. 
            <div className='select-saved'>
              {localStorage.getItem('customData') !== null ?
                <select onChange={(e) => {
                  const customData = JSON.parse(localStorage.getItem('customData') || '[]');
                  const selectedData = customData[e.target.value];
                  setCustomApiKey(selectedData.customApiKey);
                  setCustomUrl(selectedData.customUrl);
                  setExplorerUrl(selectedData.explorerUrl);
                }}>
                  {JSON.parse(localStorage.getItem('customData') || '[]').map((data: any, index: number) => {
                    return <option key={index} value={index}>{data.customUrl}</option>
                  })}
                </select>
                : null
              }
            </div>
            <div className="custom-apikey">
              <label htmlFor="custom-apikey">Custom API Key</label>
            </div>
            <input
              type="text"
              id="custom-apikey"
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              placeholder="Enter API Key"
            />
            <div className="custom-url">
              <label htmlFor="custom-url">Custom URL</label>
            </div>
            <input
              type="text"
              id="custom-url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="Enter URL"
            />
            <div className="custom-explorer">
              <label htmlFor="custom-explorer">Custom Explorer URL</label>
            </div>
            <input
              type="text"
              id="custom-explorer"
              value={explorerUrl}
              onChange={(e) => setExplorerUrl(e.target.value)}
              placeholder="Enter Explorer URL"
            />
            <button onClick={() => {
              saveCustomData();
              setCustomCheck(!customCheck);
            }}>Save</button>
          </div>
          : null
        }
      </div>
      
      <button onClick={() => setCustomCheck(!customCheck)}>Custom api {customApiKey === '' ? 'off' : 'on'}</button>

      <div>
        <AddressForm onSearch={handleAddressSearch} />
        <div>
          <button onClick={() => setSelectedTransactionType('ethTransactions')}>ETH Transactions</button>
          <button onClick={() => setSelectedTransactionType('erc20Transactions')}>ERC-20 Transactions</button>
        </div>
        <div style={{ height: '85vh', width: '100%' }}>
          <TransactionHistory transactions={transactions[selectedTransactionType]} our_address={ourAddress} related_addresses={[]} explorer_url={explorerUrl} />
        </div>
      </div>
    </div>
  );
};

export default App;
