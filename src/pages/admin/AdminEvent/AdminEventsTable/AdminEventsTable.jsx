import React from 'react';
import './EventsTable.css';

const Table = ({ 
    columns, 
    data, 
    onEdit, 
    onDelete, 
    isLoading,
    actions = true 
}) => {
    if (isLoading) {
        return <div className="table-loading">Loading...</div>;
    }

    return (
        <div className="table-container">
            <div className="table-wrapper">
                <table className="custom-table">
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th key={column.key}>{column.label}</th>
                            ))}
                            {actions && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="no-data">
                                    No data available
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr key={item._id}>
                                    {columns.map((column) => (
                                        <td key={`${item._id}-${column.key}`}>
                                            {column.render ? 
                                                column.render(item[column.key], item) : 
                                                item[column.key]}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="action-buttons">
                                            <button 
                                                className="edit-button"
                                                onClick={() => onEdit(item)}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                className="delete-button"
                                                onClick={() => onDelete(item._id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Table;
