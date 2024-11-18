import React, { useEffect } from 'react';

export default function Test() {
    function getPortfolioDetails() {
        return [
            { name: 'Stock A', quantity: 10, price: 100 },
            { name: 'Stock B', quantity: 5, price: 200 },
            // Add more portfolio details as needed
        ];
    }

    // Function to create and display the portfolio table
    function displayPortfolioTable() {
        const portfolioDetails = getPortfolioDetails();
        const table = document.createElement('table');
        table.className = 'portfolio-table';

        // Create table header
        const header = table.createTHead();
        const headerRow = header.insertRow(0);
        const headers = ['Name', 'Quantity', 'Price'];
        headers.forEach((text, index) => {
            const cell = headerRow.insertCell(index);
            cell.outerHTML = `<th>${text}</th>`;
        });

        // Create table body
        const body = table.createTBody();
        portfolioDetails.forEach(detail => {
            const row = body.insertRow();
            Object.values(detail).forEach((value, index) => {
                const cell = row.insertCell(index);
                cell.textContent = value;
            });
        });

        // Append the table to the portfolio-table element
        const portfolioTableElement = document.getElementById('portfolio-table');
        portfolioTableElement.innerHTML = ''; // Clear any existing content
        portfolioTableElement.appendChild(table);
    }

    useEffect(() => {
        displayPortfolioTable();
    }, []);

    return (
        <div>
            <div id="portfolio-table"></div>
        </div>
    );
}