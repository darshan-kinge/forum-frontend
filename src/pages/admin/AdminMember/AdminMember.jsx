import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Table from '../../../components/table/Table.jsx';
import { FaFileExport } from 'react-icons/fa';
import './AdminMember.css';

const MembersPage = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState(null);
    const { AuthorizationToken } = useAuth();
    const membersPerPage = 15;

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/v1/member/all', {
                headers: {
                    'Authorization': AuthorizationToken
                }
            });
            if (!response.ok) throw new Error('Failed to fetch members');
            const data = await response.json();
            setMembers(data);
            console.log(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatGender = (gender) => {
        return gender === 'male' ? 'M' : 'F';
    };

    const exportToCSV = () => {
        const headers = ['Name', 'PRN', 'Gender', 'Email', 'Course', 'Year', 'Member ID', 'Joined Date'];
        const csvData = members.map(member => [
            `${member.first_name} ${member.last_name}`,
            member.prn,
            formatGender(member.gender),
            member.email,
            member.course,
            member.year,
            member.member_id,
            formatDate(member.createdAt)
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'members.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Calculate pagination
    const indexOfLastMember = currentPage * membersPerPage;
    const indexOfFirstMember = indexOfLastMember - membersPerPage;
    const currentMembers = members.slice(indexOfFirstMember, indexOfLastMember);
    const totalPages = Math.ceil(members.length / membersPerPage);

    const columns = [
        { 
            key: 'name', 
            label: 'Name',
            render: (_, member) => `${member.first_name} ${member.last_name}`
        },
        { key: 'prn', label: 'PRN' },
        { 
            key: 'gender', 
            label: 'Gender', 
            render: (_, member) => formatGender(member.gender) 
        },
        { key: 'email', label: 'Email' },
        { key: 'course', label: 'Course' },
        { key: 'year', label: 'Year' },
        { key: 'member_id', label: 'Member ID' },
        { 
            key: 'createdAt', 
            label: 'Joined Date',
            render: (date) => formatDate(date)
        }
    ];

    if (error) return <div className="members-error">{error}</div>;

    return (
        <div className="members-page">
            <div className="members-header">
                <h1>Members</h1>
                <button className="export-button" onClick={exportToCSV}>
                    <FaFileExport /> Export to CSV
                </button>
            </div>

            <div className="members-table">
                <Table
                    columns={columns}
                    data={currentMembers}
                    isLoading={loading}
                    actions={false}
                />

                {members.length > membersPerPage && (
                    <div className="pagination">
                        <button 
                            className="page-button"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                        >
                            Previous
                        </button>
                        
                        <div className="page-numbers">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                <button
                                    key={number}
                                    className={`page-number ${currentPage === number ? 'active' : ''}`}
                                    onClick={() => setCurrentPage(number)}
                                >
                                    {number}
                                </button>
                            ))}
                        </div>

                        <button 
                            className="page-button"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MembersPage;
