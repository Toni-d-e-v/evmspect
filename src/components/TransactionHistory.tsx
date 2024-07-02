import React, { useState } from 'react';
import ReactFlow, { Background, Controls, Edge, Node, XYPosition, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import '../css/Popup.css'; // Create a CSS file to style the popup

interface PopupProps {
  nodeData: any;
  onClose: () => void;
  explorer_url: string;
}

const Popup: React.FC<PopupProps> = ({ nodeData, onClose, explorer_url }) => {
  let nodeType = '';
  if (nodeData.id.startsWith('transaction')) {
    nodeType = 'Transaction';
  } else if (nodeData.id.startsWith('address')) {
    nodeType = 'Address';
  } else {
    nodeType = 'Unknown';
  }

  return (
    <div className="popup-container">
      {/* Popup content */}
      <div className="popup">
        <h3>Details</h3>
        {nodeType === 'Transaction' && (
          <div>
            <p>Transaction Hash: {nodeData.id.substring(12).substring(0, 24)}</p>
            <p>Transaction Value: {nodeData.data.label.substring(14)}</p>
            <a style={{ color: 'black' }} href={`${explorer_url}tx/${nodeData.id.substring(12)}`} target="_blank" rel="noopener noreferrer">
              View on Etherscan
            </a>
          </div>
        )}
        {nodeType === 'Address' && (
          <div>
            <p>Address: {nodeData.id.substring(8)}</p>
            <div style={{ display: 'flex', padding: '1px' }}>
              <a style={{ color: 'black', margin: '4px' }} href={`${explorer_url}/address/${nodeData.id.substring(8)}`} target="_blank" rel="noopener noreferrer">
                View on Etherscan
              </a>
              {/* <a style={{ color: 'black', margin: '4px' }} href={`/?address=${nodeData.id.substring(8)}`} target="_blank" rel="noopener noreferrer">Open in EVMSpect</a> */}
            </div>
          </div>
        )}
        {nodeType === 'Unknown' && (
          <div>
            <p>{nodeData.id}</p>
            <a style={{ color: 'black', margin: '4px' }} href={`${explorer_url}/address/${nodeData.id}`} target="_blank" rel="noopener noreferrer">
              View on Etherscan
            </a>
          </div>
        )}
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
  tokenDecimal: number;
  tokenSymbol: string;
}

interface TransactionHistoryProps {
  transactions: EVMtx[];
  our_address: string;
  related_addresses: string[];
  explorer_url: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, our_address, related_addresses, explorer_url }) => {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [filteredNodes, setFilteredNodes] = useState<Node[]>([]);
  const [filteredEdges, setFilteredEdges] = useState<Edge[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);

  if (explorer_url === '') {
    explorer_url = 'https://etherscan.io/';
  }

  const handleElementClick = (event: React.MouseEvent, element: any) => {
    if (element?.id && element?.type === 'default') {
      setSelectedNode(element);
      applyFilter(element);
    } else {
      setSelectedNode(null);
      setIsFiltering(false);
    }
  };

  const closePopup = () => {
    setSelectedNode(null);
    setIsFiltering(false);
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

  const relatedNodes: Node[] = related_addresses.map((address, index) => ({
    id: address,
    type: 'default',
    position: {
      x: 200,
      y: 100 * index,
    },
    data: { label: address.substring(0, 12) },
  }));

  const transactionNodesToUs: Node[] = transactions
    .filter((transaction) => transaction.to.toLowerCase() === our_address.toLowerCase())
    .map((transaction, index) => {
      const value = transaction.tokenSymbol
        ? `${Number(transaction.value) / Math.pow(10, transaction.tokenDecimal)} ${transaction.tokenSymbol}`
        : `${Number(transaction.value) / 1000000000000000000} ETH`;

      return {
        id: `transaction-${transaction.hash}`,
        type: 'default',
        position: {
          x: -400,
          y: 100 * (related_addresses.length + index),
        },
        data: { label: `Transaction ${transaction.hash.substring(0, 12)} - ${value}` },
      };
    });

  const transactionNodesFromUs: Node[] = transactions
    .filter((transaction) => transaction.from.toLowerCase() === our_address.toLowerCase())
    .map((transaction, index) => {
      const value = transaction.tokenSymbol
        ? `${Number(transaction.value) / Math.pow(10, transaction.tokenDecimal)} ${transaction.tokenSymbol}`
        : `${Number(transaction.value) / 1000000000000000000} ETH`;

      return {
        id: `transaction-${transaction.hash}`,
        type: 'default',
        position: {
          x: 600,
          y: 100 * (related_addresses.length + index),
        },
        data: { label: `Transaction ${transaction.hash.substring(0, 12)} - ${value}` },
      };
    });

  const relatedAddressesNodes = transactions
    .filter((transaction) => transaction.from !== our_address.toLowerCase())
    .map((transaction, index) => ({
      id: `address-${transaction.from}`,
      type: 'default',
      position: {
        x: -800,
        y: 100 * (related_addresses.length + index),
      },
      data: { label: `Address ${transaction.from.substring(0, 12)}` },
    }));

  const relatedAddressesNodes2 = transactions
    .filter((transaction) => transaction.to !== our_address.toLowerCase())
    .map((transaction, index) => ({
      id: `address-${transaction.to}`,
      type: 'default',
      position: {
        x: 900,
        y: 100 * (related_addresses.length + index),
      },
      data: { label: `Address ${transaction.to.substring(0, 12)}` },
    }));

  const tx_length = transactions.length;

  const relatedEdges: Edge[] = relatedNodes.map((node) => ({
    id: `edge-${node.id}-${our_address}`,
    source: node.id,
    target: our_address,
    type: tx_length > 1000 ? 'straight' : 'simplebezier',
  }));

  const relatedEdges2: Edge[] = transactions
    .filter((transaction) => transaction.to.toLowerCase() === our_address.toLowerCase())
    .map((transaction) => ({
      id: `edge-${transaction.hash}-${our_address}`,
      source: `transaction-${transaction.hash}`,
      target: our_address,
      type: tx_length > 1000 ? 'straight' : 'simplebezier',
    }));

  const relatedEdges3: Edge[] = transactions
    .filter((transaction) => transaction.from.toLowerCase() === our_address.toLowerCase())
    .map((transaction) => ({
      id: `edge-${transaction.hash}-${our_address}`,
      source: `transaction-${transaction.hash}`,
      target: our_address,
      type: tx_length > 1000 ? 'straight' : 'simplebezier',
    }));

  const relatedEdges4: Edge[] = transactions
    .filter((transaction) => transaction.from.toLowerCase() === our_address.toLowerCase())
    .map((transaction) => ({
      id: `edge-${transaction.hash}-${transaction.to}`,
      source: `transaction-${transaction.hash}`,
      target: transaction.to,
      type: tx_length > 1000 ? 'straight' : 'simplebezier',
    }));

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

  const allNodes = [ourNode, ...relatedNodes, ...transactionNodesToUs, ...transactionNodesFromUs, ...relatedAddressesNodes, ...relatedAddressesNodes2];
  const allEdges = relatedEdges.concat(relatedEdges2).concat(relatedEdges3).concat(relatedEdges4).concat(relatedEdges5).concat(relatedEdges6);

  const applyFilter = (element: Node) => {
    setIsFiltering(true);
  
    if (element.id.startsWith('transaction')) {
      // If the selected element is a transaction, show only its path
      const transactionId = element.id;
      
      // Find edges related to this transaction
      const relatedEdges = allEdges.filter(edge => edge.source === transactionId || edge.target === transactionId);
      
      // Find nodes related to this transaction
      const relatedNodeIds = relatedEdges.map(edge => (edge.source === transactionId ? edge.target : edge.source));
      
      // Include the transaction node itself
      const filteredNodes = allNodes.filter(node => node.id === transactionId || relatedNodeIds.includes(node.id));
      
      // Include the edges connected to the transaction
      const filteredEdges = allEdges.filter(edge => filteredNodes.some(node => node.id === edge.source) && filteredNodes.some(node => node.id === edge.target));
      
      setFilteredNodes(filteredNodes);
      setFilteredEdges(filteredEdges);
    } else {
      // Otherwise, show the main address and related nodes as before
      const filterRelatedNodesAndEdges = (nodeId: string) => {
        // Find directly related edges
        const directlyRelatedEdges = allEdges.filter(edge => edge.source === nodeId || edge.target === nodeId);
        
        // Find nodes directly related to the selected node
        const directlyRelatedNodeIds = directlyRelatedEdges.map(edge => (edge.source === nodeId ? edge.target : edge.source));
        
        // Include start and end nodes (addresses) related to the selected transactions
        const startEndNodeIds = new Set();
        directlyRelatedNodeIds.forEach(relatedNodeId => {
          allEdges.forEach(edge => {
            if (edge.source === relatedNodeId || edge.target === relatedNodeId) {
              startEndNodeIds.add(edge.source);
              startEndNodeIds.add(edge.target);
            }
          });
        });
        
        // Convert Set to Array and filter nodes
        const startEndNodeArray = Array.from(startEndNodeIds);
        const filteredNodes = allNodes.filter(node => node.id === our_address || startEndNodeArray.includes(node.id));
        
        // Include edges connecting the main address node and related nodes
        const filteredEdges = allEdges.filter(edge => filteredNodes.some(node => node.id === edge.source) && filteredNodes.some(node => node.id === edge.target));
        
        return { filteredNodes, filteredEdges };
      };
      
      const { filteredNodes, filteredEdges } = filterRelatedNodesAndEdges(element.id);
      setFilteredNodes(filteredNodes);
      setFilteredEdges(filteredEdges);
    }
  };
  
  

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {selectedNode && <Popup nodeData={selectedNode} onClose={closePopup} explorer_url={explorer_url} />}
      <ReactFlow
        nodes={isFiltering ? filteredNodes : allNodes}
        edges={isFiltering ? filteredEdges : allEdges}
        onNodeClick={handleElementClick}
      >
        <Background color="#00ADB5" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default TransactionHistory;
