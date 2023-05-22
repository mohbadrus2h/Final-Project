import React, { useState } from 'react';
import socketIOClient from 'socket.io-client';

const SearchForm = ({ onSearch, onError }) => {
    const [startDate, setStartDate] = useState('');
    // const [endDate, setEndDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = e => {
        e.preventDefault();

        // if (startDate > endDate) {
        //     onError('Start date must be before end date');
        //     return;
        // }

        setIsLoading(true);

        const socket = socketIOClient();

        socket.emit('search', { startDate});

        socket.on('search_result', data => {
            setIsLoading(false);
            onSearch(data);
        });

        socket.on('search_error', error => {
            setIsLoading(false);
            onError(error.message);
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="start-date">Start Date:</label>
            <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} />

            {/* <label htmlFor="end-date">End Date:</label>
            <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} /> */}

            <button type="submit" disabled={isLoading}>Search</button>

            {isLoading && <span>Loading...</span>}
        </form>
    );
};

export default SearchForm;