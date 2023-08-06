import React, { useState } from 'react';
import AddressForm from './components/AddressForm';
import TransactionHistory from './components/TransactionHistory';
import { getTransactionHistory } from './api/etherscan';
import Navbar from './components/Navbar';

const App: React.FC = () => {

  // if device mobile
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [our_address, setOurAddress] = useState<string>('');
  const [custom_apikey, setCustomApikey] = useState<string>('');
  const [custom_url, setCustomUrl] = useState<string>('');
  const [custom_check, setCustomCheck] = useState<boolean>(true);
  const [explorer_url, setExplorerUrl] = useState<string>('');
  const handleAddressSearch = async (address: string) => {
    const txHistory = await getTransactionHistory(address, custom_apikey, custom_url);
    setOurAddress(address);
    setTransactions(txHistory);
  };
  const saveCustomData = () => {
    if (localStorage.getItem('customData') === null) {
      localStorage.setItem('customData', JSON.stringify([]));
    }
    const customData = JSON.parse(localStorage.getItem('customData') || '{}');
    customData.push({
      custom_apikey: custom_apikey,
      custom_url: custom_url,
      explorer_url: explorer_url
    });
    localStorage.setItem('customData', JSON.stringify(customData));
  }
  

  // search for ?address=0x... in url
  const urlParams = new URLSearchParams(window.location.search);
  const address = urlParams.get('address');
  // get ohter
  if (address && address !== our_address) {
    // remove ?address=0x... from url
    // window.history.replaceState({}, document.title, "/" + "evmspect");
    handleAddressSearch(address);

  }

  return (
      <div>
        <Navbar />  
        {/* gird */}
        <div>
          {/* title */}
          {/* custom apikey and url */}
          { custom_check === false ? 
            <div className="custom">
              Use custom apikey and url for any EVM network, e.g. BSC, Polygon, etc. like <a href="https://bscscan.com/" target="_blank" rel="noopener noreferrer">BSCScan</a> or <a href="https://polygonscan.com/" target="_blank" rel="noopener noreferrer">PolygonScan</a>. 
              <div className='select-saved'>
                {
                  localStorage.getItem('customData') !== null ?
                  <select onChange={(e) => {
                    const customData = JSON.parse(localStorage.getItem('customData') || '{}');
                    const selectedData = customData[e.target.value];
                    setCustomApikey(selectedData.custom_apikey);
                    setCustomUrl(selectedData.custom_url);
                    setExplorerUrl(selectedData.explorer_url);
                    // set name  of selecatble option
                  }
                  }>
                    {
                      JSON.parse(localStorage.getItem('customData') || '{}').map((data: any, index: number) => {
                        return <option value={index}>{data.custom_url}</option>
                      })
                    }
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
                  value={custom_apikey}
                  onChange={(e) => setCustomApikey(e.target.value)}
                  placeholder="Enter API Key"
                />
              <div className="custom-url">
                <label htmlFor="custom-url">Custom URL</label>
                </div>
                <input
                  type="text"
                  id="custom-url"
                  value={custom_url}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="Enter URL"
                />
              <div className="custom-explorer">
                <label htmlFor="custom-explorer">Custom Explorer URL</label>
                </div>
                <input
                  type="text"
                  id="custom-explorer"
                  value={explorer_url}
                  onChange={(e) => setExplorerUrl(e.target.value)}
                  placeholder="Enter Explorer URL"
                />
                              <button onClick={() => {
                saveCustomData();
                setCustomCheck(!custom_check);
              }}>Save</button>
              </div>



              : null
          }
        </div>
        
        <button onClick={() => setCustomCheck(!custom_check)}>Custom api {custom_apikey === '' ? 'off' : 'on'}</button>
        {/* address form */}
        <div>
          <AddressForm onSearch={handleAddressSearch} />
  
          <div style={{ height: '85vh', width: '100%' }}>
            <TransactionHistory transactions={transactions} our_address={our_address} related_addresses={[]} explorer_url={explorer_url} />

          </div>

        </div>
      </div>
  );
  
};

export default App;
