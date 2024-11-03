import React, { useState, useEffect } from 'react';
import Login from './Components/Login';
import Home from './Components/Home';
import Table from './Components/Table';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [emailData, setEmailData] = useState(null);
    const [loading, setLoading] = useState(true); // Initialize loading state

    // Fetch email data from backend after login
    useEffect(() => {
        setLoading(true); // Set loading to true when starting to fetch data
        fetch('http://localhost:2000/api/emails')
            .then((response) => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then((data) => {
                setEmailData(data);
                setLoading(false); // Set loading to false after data is fetched
            })
            .catch((error) => {
                console.error('Error fetching email data:', error);
                setLoading(false); // Set loading to false in case of error
            });
    }, []);

    const handleLogin = () => setIsLoggedIn(true);

    const handleCardClick = () => {
        // Filter email data for all classifications (confirmations, cancellations, refunds)
        if (emailData) {
            const filteredData = emailData.filter(item => {
                return (
                    item.classification === 'Booking Confirmation' || 
                    item.classification === 'CancelTicket' || 
                    item.classification === 'Refund'
                );
            });

            const formattedData = filteredData.map(item => ({
                date: item.date || 'N/A', 
                confirmation: item.ticketInfo?.['PNR No'] || 'N/A',
                cancellation: item.ticketInfo?.['Refund Amount'] || 'N/A',
                refund: item.ticketInfo?.['Refund Reference No'] || 'N/A'
            }));

            setSelectedData(formattedData);
        }
    };

    // While loading is true, display loader
    if (loading) {
        return (
            <div className="loader-container">
                <div className="loader"> LOADING </div>
            </div>
        ); 
    }

    // Render content if not loading
    return (
        <div>
            {selectedData ? (
                <Table data={selectedData} />
            ) : (
                <Home onCardClick={handleCardClick} />
            )}
        </div> 
    );
};

export default App;
