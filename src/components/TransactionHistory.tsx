import React from 'react';

import { useState } from 'react';
import ReactFlow, { Background, Controls,Edge, Node,XYPosition,MarkerType  } from 'reactflow';
import 'reactflow/dist/style.css';
import '../css/Popup.css'; // Create a CSS file to style the popup

interface PopupProps {
  nodeData: any;
  onClose: () => void;
  explorer_url: string;
}

const Popup: React.FC<PopupProps> = ({ nodeData, onClose,explorer_url }) => {
  let nodeType = '';
  if (nodeData.id.startsWith('transaction')) {
    nodeType = 'Transaction';
  } else if (nodeData.id.startsWith('address')) {
    nodeType = 'Address';
  } 
  else {
    nodeType = 'Unknown';
  }
  return (
    <div className="popup-container">
      {/* Popup content */}
      <div className="popup">
        <h3>Details</h3>
        {
          nodeType === 'Transaction' && (
            <div>
              <p>Transaction Hash: {nodeData.id.substring(12).substring(0, 24)}</p>
              <p>Transaction Value: {nodeData.data.label.substring(14)}</p>
              <a style={{ color: 'black' }} href={`${explorer_url}tx/${nodeData.id.substring(12)}`} target="_blank" rel="noopener noreferrer">View on Etherscan</a>
            </div>
          )
        }
        {
          nodeType === 'Address' && (
            <div>
              <p>Address: {nodeData.id.substring(8)}</p>
              <div style={{ display: 'flex', padding: '1px'}}>
                  
                <a style={{ color: 'black', margin: '4px'}} href={`${explorer_url}/address/${nodeData.id.substring(8)}`} target="_blank" rel="noopener noreferrer">View on Etherscan</a>

                {/* <a style={{ color: 'black', margin: '4px' }} href={`/?address=${nodeData.id.substring(8)}`} target="_blank" rel="noopener noreferrer">Open in EVMSpect</a> */}
              </div>
            </div>
          )
      }
      {
          nodeType === 'Unknown' && (
            <div>
              <p>
                {nodeData.id}
              </p>
              <a style={{ color: 'black', margin: '4px'}} href={`${explorer_url}/address/${nodeData.id}`} target="_blank" rel="noopener noreferrer">View on Etherscan</a>

            </div>
          )
      }
         <p></p>
        {/* Add other node details you want to display */}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

interface EVMtx {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
}

interface TransactionHistoryProps {
  transactions: EVMtx[];
  our_address: string;
  related_addresses: string[];
  explorer_url: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, our_address, related_addresses,explorer_url }) => {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  if (explorer_url === '') {
    explorer_url = 'https://etherscan.io/';
  }
  // Function to handle element click
  const handleElementClick = (event: React.MouseEvent, element: any) => {
    if (element?.id && element?.type === 'default') {
      setSelectedNode(element);
    } else {
      setSelectedNode(null);
    }
  };
  const closePopup = () => {
    setSelectedNode(null);
  };

  if (!our_address) {
    return null;
  }
  const ourNode = {
    id: our_address,
    type: 'default',
    position: { x: 0, y: 0 },
    data: { label: our_address.substring(0, 12) },
  };

  // Create nodes for related addresses
  const relatedNodes: Node[] = related_addresses.map((address, index) => ({
    id: address,
    type: 'default',
    position: {
      x: 200, // Adjust the position as needed to place the nodes on the right side
      y: 100 * index, // Adjust the spacing between nodes on the right side
    },
    data: { label: address.substring(0, 12) },
  }));

  // Create nodes for transactions that send to our_address
  const transactionNodesToUs: Node[] = transactions
    .filter((transaction) => transaction.to.toLowerCase() === our_address.toLowerCase())
    .map((transaction, index) => ({
      id: `transaction-${transaction.hash}`,
      type: 'default',
      position: {
        x: -400, // Place transactions on the right side, adjust as needed
        y: 100 * (related_addresses.length + index), // Adjust the vertical spacing between transaction nodes
      },
      data: { label: `Transaction ${transaction.hash.substring(0, 12)} - ${Number(transaction.value) / 1000000000000000000} ETH` },
    }));
  const transactionNodesFromUs: Node[] = transactions
    .filter((transaction) => transaction.from.toLowerCase() === our_address.toLowerCase())
    .map((transaction, index) => ({
      id: `transaction-${transaction.hash}`,
      type: 'default',
      position: {
        x: 600, // Place transactions on the right side, adjust as needed
        y: 100 * (related_addresses.length + index), // Adjust the vertical spacing between transaction nodes
      },
      data: { label: `Transaction ${transaction.hash.substring(0, 12)} - ${Number(transaction.value) / 1000000000000000000} ETH` },
    }));
  const relatedAddressesNodes = transactions
    .filter((transaction) => transaction.from !== our_address.toLowerCase() )
    .map((transaction, index) => ({
      id: `address-${transaction.from}`,
      type: 'default',
      position: {
        x: -800, // Place transactions on the right side, adjust as needed
        y: 100 * (related_addresses.length + index), // Adjust the vertical spacing between transaction nodes
      },
      data: { label: `Address ${transaction.from.substring(0, 12)}` },
    }));
  const relatedAddressesNodes2 = transactions
    .filter((transaction) => transaction.to !== our_address.toLowerCase() )
    .map((transaction, index) => ({
      id: `address-${transaction.to}`,
      type: 'default',
      position: {
        x: 900, // Place transactions on the right side, adjust as needed
        y: 100 * (related_addresses.length + index), // Adjust the vertical spacing between transaction nodes
      },
      data: { label: `Address ${transaction.to.substring(0, 12)}` },
    }));

  const tx_length = transactions.length;
  // Create edges from related addresses to our_address
  // Create edges from related addresses to our_address
  const relatedEdges: Edge[] = relatedNodes.map((node) => ({
    id: `edge-${node.id}-${our_address}`,
    source: node.id,
    target: our_address,
    // type: 'simplebezier',
    // if size over 1000 disable for performance
    type: tx_length > 1000 ? 'straight' : 'simplebezier',
  }));

  // Create edges from our_address to transactions sent from our_address
  const relatedEdges2: Edge[] = transactions
    .filter((transaction) => transaction.to.toLowerCase() === our_address.toLowerCase())
    .map((transaction) => ({
      id: `edge-${transaction.hash}-${our_address}`,
      source: `transaction-${transaction.hash}`,
      target: our_address,
      type: tx_length > 1000 ? 'straight' : 'simplebezier',
    }));

  // Create edges from our_address to transactions received by our_address
  const relatedEdges3: Edge[] = transactions
    .filter((transaction) => transaction.from.toLowerCase() === our_address.toLowerCase())
    .map((transaction) => ({
      id: `edge-${transaction.hash}-${our_address}`,
      source: `transaction-${transaction.hash}`,
      target: our_address,
      type: tx_length > 1000 ? 'straight' : 'simplebezier',
    }));

  // Create edges from transactions sent from our_address to the recipient addresses
  const relatedEdges4: Edge[] = transactions
    .filter((transaction) => transaction.from.toLowerCase() === our_address.toLowerCase())
    .map((transaction) => ({
      id: `edge-${transaction.hash}-${transaction.to}`,
      source: `transaction-${transaction.hash}`,
      target: transaction.to,
      type: tx_length > 1000 ? 'straight' : 'simplebezier',
    }));

  // Create edges from sender addresses to transactions that were sent to our_address
  const relatedEdges5: Edge[] = transactions.map((transaction) => ({
    id: `edge-${transaction.from}-${transaction.hash}`,
    source: `transaction-${transaction.hash}`,
    target: `address-${transaction.from}`,
    type: tx_length > 1000 ? 'straight' : 'simplebezier',
  }));
  const relatedEdges6: Edge[] = transactions.map((transaction) => ({
    id: `edge-${transaction.to}-${transaction.hash}`,
    source: `transaction-${transaction.hash}`,
    target: `address-${transaction.to}`,
    type: tx_length > 1000 ? 'straight' : 'simplebezier',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    markerStart: {
      type: MarkerType.ArrowClosed,
      orient: 'auto-start-reverse',
    },
  }));
  






  return (
    <div style={{ width: '100%', height: '100%' }}>
      {selectedNode && (
        <Popup nodeData={selectedNode} onClose={closePopup} explorer_url={explorer_url} />
      )}
      <ReactFlow
        nodes={[ourNode, ...relatedNodes, ...transactionNodesToUs, ...transactionNodesFromUs, ...relatedAddressesNodes, ...relatedAddressesNodes2]}
        edges={relatedEdges.concat(relatedEdges2).concat(relatedEdges3).concat(relatedEdges4).concat(relatedEdges5).concat(relatedEdges6)}
        onNodeClick={handleElementClick} // Add this line to handle the element click event
        // snapToGrid={true}
        // snapGrid={[20, 20]}
      >
        <Background color="#00ADB5" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
};


export default TransactionHistory;
