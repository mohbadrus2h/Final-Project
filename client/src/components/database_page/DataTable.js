import React from 'react';

const DataTable = ({ data, tableRef }) => {
    return (
        <table ref={tableRef}>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Value 1</th>
                    <th>Value 2</th>
                </tr>
            </thead>
            <tbody>
                {data.map(row => (
                    <tr key={row.id}>
                        <td>{row.date}</td>
                        <td>{row.value1}</td>
                        <td>{row.value2}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default DataTable;