import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataTable.css';

function useAutoSave(storageId, data) {
  useEffect(() => {
    if (data.length > 0) {
      localStorage.setItem(storageId, JSON.stringify(data));
    }
  }, [data, storageId]);
}

function DataTable() {
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem('dataTableData');
    return savedData ? JSON.parse(savedData) : [];
  });

  useAutoSave('dataTableData', data);

  useEffect(() => {
    axios.get('http://localhost:8080/api/employee')
      .then(response => {
        if (Array.isArray(response.data)) {
          // Use data from API if local storage is empty or data in local storage is stale
          const savedData = localStorage.getItem('dataTableData');
          if (!savedData) {
            setData(response.data);
          } else {
            const parsedSavedData = JSON.parse(savedData);
            if (parsedSavedData.length === 0) {
              setData(response.data);
            }
          }
        } else {
          console.error("Data is not an array:", response.data);
        }
      })
      .catch(error => {
        console.error(error);
      });
  }, [data]);

  const handleInputChange = (event, index) => {
    const { name, value } = event.target;
    const newData = [...data];
    newData[index][name] = value;
    setData(newData);
  };

  const handleSave = () => {
    axios.put('http://localhost:8080/api/employee/bulk', data)
      .then(response => {
        if (Array.isArray(response.data)) {
          setData(response.data);
          localStorage.setItem('dataTableData', JSON.stringify(response.data)); // Update local storage after save
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  const handleAddRow = () => {
    const newRow = { name: '', role: '' };
    setData([...data, newRow]);
  };

  const handleDeleteRow = (index, id) => {
    // If the row doesn't have an ID (it's a new row not yet saved to the backend), just delete it locally
    if (!id) {
      const newData = data.filter((_, i) => i !== index);
      setData(newData);
      localStorage.setItem('dataTableData', JSON.stringify(newData)); // Update local storage after delete
      return;
    }
    axios.delete(`http://localhost:8080/api/employee/${id}`)
      .then(response => {
        if (response.status === 200) {
          const newData = data.filter((_, i) => i !== index);
          setData(newData);
          localStorage.setItem('dataTableData', JSON.stringify(newData)); // Update local storage after delete
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  return (
    <div className="data-table-container">
      <div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(data) ? (
              data.map((row, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      name="name"
                      className="no-border-input"
                      value={row.name}
                      onChange={(event) => handleInputChange(event, index)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="role"
                      className="no-border-input"
                      value={row.role}
                      onChange={(event) => handleInputChange(event, index)}
                    />
                  </td>
                  <td>
                    <button onClick={() => handleDeleteRow(index, row.id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
        <button onClick={handleAddRow}>Add Row</button>
        <button onClick={handleSave}>Save</button>
      </div>
    </div>
  );
}

export default DataTable;
