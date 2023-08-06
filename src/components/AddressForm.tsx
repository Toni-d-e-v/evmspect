import React, { useState } from 'react';

interface AddressFormProps {
  onSearch: (address: string) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ onSearch }) => {
  const [address, setAddress] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(address);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={address} onChange={handleInputChange} placeholder="Enter Ethereum address" />
      <button type="submit">Search</button>
    </form>
  );
};

export default AddressForm;
