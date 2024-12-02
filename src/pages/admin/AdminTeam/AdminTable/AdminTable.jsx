// src/components/Admin/AdminTable.js
import React from 'react';
import '../../AdminTeam/AdminStyle.css';
import { useAuth } from '../../../../context/AuthContext.jsx'; 

const AdminTable = ({ members, loading, onEdit, onRefresh }) => {
  const { AuthorizationToken } = useAuth();
  const [currentPage, setCurrentPage] = React.useState(1);
  const membersPerPage = 5;

  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = members.slice(indexOfFirstMember, indexOfLastMember);
  const totalPages = Math.ceil(members.length / membersPerPage);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        const response = await fetch(`http://localhost:3000/api/v1/team/delete/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': AuthorizationToken
          }
        });

        if (response.ok) {
          alert('Member deleted successfully');
          onRefresh();
        } else {
          console.error('Failed to delete member');
        }
      } catch (error) {
        console.error('Error deleting member:', error);
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentMembers.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', fontWeight: 'bold' }}>No members found</td>
            </tr>
          )}
          {currentMembers.map(member => (
            <tr key={member._id}>
              <td>
                <img 
                  src={member.photo} 
                  alt={member.name} 
                  className="member-thumbnail"
                />
              </td>
              <td>{member.name}</td>
              <td>{member.email}</td>
              <td>{member.role}</td>
              <td className='btn-group'>    
                <button 
                  className="btn btn-edit"
                  onClick={() => onEdit(member)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-delete"
                  onClick={() => handleDelete(member._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {members.length > membersPerPage && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn"
          >
            Previous
          </button>
          <span>{currentPage} of {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminTable;