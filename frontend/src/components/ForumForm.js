
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaImage, FaRegFileAlt, FaCheck, FaTimes, FaExclamationCircle, FaTrashAlt } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';

// FileDropzone Component
const FileDropzone = ({ onDrop, visible }) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop,
  });

  if (!visible) return null;

  return (
    <div {...getRootProps()} style={styles.dropzoneContainer}>
      <input {...getInputProps()} style={styles.input} />
    </div>
  );
};

// Text Modal Component
const TextModal = ({ isOpen, onClose, onSave, value }) => {
  const [text, setText] = useState(value);

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContainer}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your note here"
          rows="5"
          style={styles.textarea}
        />
        <div style={styles.modalActions}>
          <button onClick={() => onSave(text)} style={styles.modalSaveButton}>Save</button>
          <button onClick={onClose} style={styles.modalCloseButton}>Close</button>
        </div>
      </div>
    </div>
  );
};


const ForumForm = () => {
  const [forumRows, setForumRows] = useState([]);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRowIndex, setCurrentRowIndex] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  // const [selectedSymbol, setSelectedSymbol] = useState('')
  const [fields, setFields] = useState([]);
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState({ isAuthenticated: false, isAdmin: false });
  const [deletingIndex, setDeletingIndex] = useState(null);  // To track which row is being deleted

  const handleSelectSymbol = (symbol) => {
    setSelectedSymbol(symbol);
    // console.log('Selected Symbol:', symbol);
  };
  // Fetch forum names and fields data from the API
  const fetchFields = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/fields');
      if (Array.isArray(response.data)) {
        const extractedFields = response.data.map(forum => forum.fields).flat();
        const fetchedForums = response.data.map(forum => forum.forumName);
        setForums(fetchedForums);
        setFields(extractedFields);

        const initialForumRows = extractedFields.map((field, index) => ({
          title: '',
          note: '',
          files: [],
          forumName: fetchedForums[index] || 'Submit Your Forum',
          field,
        }));
        setForumRows(initialForumRows);
      }
    } catch (error) {
      console.error('Error fetching fields:', error);
      setFields([]);
    } finally {
      setLoading(false);
    }
  };

  // Set the authentication state
  useEffect(() => {
    fetchFields();
    const token = localStorage.getItem('token');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    setAuthState({ isAuthenticated: !!token, isAdmin });
  }, []);

  const handleAddRow = () => {
    if (forumRows.length < 4) {
      setForumRows([
        ...forumRows,
        {
          title: '',
          note: '',
          files: [],
          forumName: 'Submit Your Forum',
        },
      ]);
      setShowImageUpload(false);
    } else {
      alert('You can only submit up to 4 forums at a time.');
    }
  };

  // Handle form row changes
  const handleRowChange = (index, type, value) => {
    const newRows = [...forumRows];
    newRows[index][type] = value;
    setForumRows(newRows);
  };

  // Handle removing a row
  const handleRemoveRow = (index) => {
    const newRows = forumRows.filter((_, i) => i !== index);
    setForumRows(newRows);
  };

  // Handle file drop for the row
  const handleDrop = (index, acceptedFiles) => {
    const newRows = [...forumRows];
    newRows[index].files = acceptedFiles;
    setForumRows(newRows);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You need to be logged in to submit a forum.');
      return;
    }

    const validRows = forumRows.filter(row => row.title.trim() !== '' || row.note.trim() !== '' || row.files.length > 0);

    if (validRows.length === 0) {
      alert('Please fill out at least one forum to submit.');
      return;
    }

    try {
      for (const row of validRows) {
        const formData = new FormData();
        formData.append('title', row.title);
        formData.append('note', row.note);
        row.files.forEach(file => formData.append('images', file));

        await axios.post('http://localhost:5000/api/fields', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        });
      }

      alert('Selected forums submitted successfully!');
      setForumRows([]);
    } catch (error) {
      console.error('Error submitting forums:', error);
      alert(`Error: ${error.response ? error.response.data.message : error.message}`);
    }
  };

  // Open the modal for note input
  const handleOpenModal = (index) => {
    setCurrentRowIndex(index);
    setIsModalOpen(true);
  };

  // Close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Save the note in the form row
  const handleSaveNote = (text) => {
    const newRows = [...forumRows];
    newRows[currentRowIndex].note = text;
    setForumRows(newRows);
    setIsModalOpen(false);
  };

  // Handle forum deletion
  const handleDeleteForum = async (index) => {
    const forumToDelete = forumRows[index];
    const forumName = forumToDelete.forumName;

    if (!forumName) {
      alert('Forum name is missing!');
      return;
    }

    if (window.confirm(`Are you sure you want to delete the forum "${forumName}"?`)) {
      setDeletingIndex(index);  // Mark as deleting

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('You need to be logged in to delete a forum.');
          return;
        }

        // Send DELETE request to the backend
        await axios.delete(
          `http://localhost:5000/api/fields/${forumName}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, 
            },
          }
        );

        // Remove the deleted forum from the local state
        const updatedRows = forumRows.filter((_, i) => i !== index);
        setForumRows(updatedRows);

        alert(`Forum "${forumName}" deleted successfully!`);
      } catch (error) {
        console.error('Error deleting forum:', error);
        alert(`Error: ${error.response?.data?.message || error.message}`);
      } finally {
        setDeletingIndex(null);  // Reset deleting state
      }
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Submit Your Forum</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <form onSubmit={handleSubmit} style={styles.form}>
          {forumRows.map((row, index) => (
            <div key={index} style={styles.row}>
              <h3 style={styles.forumName}>{row.forumName}</h3>

              <input
                type="text"
                placeholder={row.field?.name || 'Enter title'}
                value={row.title}
                onChange={(e) => handleRowChange(index, 'title', e.target.value)}
                style={styles.titleInput}
              />

              <div style={styles.iconText} onClick={() => handleOpenModal(index)}>
                <FaRegFileAlt style={styles.icon} />
              </div>

              <div style={styles.iconText} onClick={() => setShowImageUpload((prev) => !prev)}>
                <FaImage style={styles.icon} />
              </div>

              <FileDropzone onDrop={(acceptedFiles) => handleDrop(index, acceptedFiles)} visible={showImageUpload} />

              {row.files.length > 0 && (
                <div style={styles.imagesContainer}>
                  <h4>Uploaded Images:</h4>
                  <ul style={styles.imagesList}>
                    {row.files.map((file, fileIndex) => (
                      <li key={fileIndex} style={styles.imageItem}>
                        <img src={URL.createObjectURL(file)} alt={file.name} style={styles.image} onLoad={() => URL.revokeObjectURL(file)} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {authState.isAdmin && (
                <button
                  type="button"
                  onClick={() => handleDeleteForum(index)}  // Delete button action
                  disabled={deletingIndex === index}  // Disable while deleting
                  style={styles.removeButton}
                >
                  {deletingIndex === index ? 'Deleting...' : <FaTrashAlt />}
                </button>
              )}
               <div style={styles.symbolContainer}>
                <div
                  style={styles.symbolButton}
                  onClick={() => handleSelectSymbol('check')}
                  className={selectedSymbol === 'check' ? 'selected' : ''}
                >
                  <FaCheck style={styles.symbolIcon} />
                </div>
                <div
                  style={styles.symbolButton}
                  onClick={() => handleSelectSymbol('times')}
                  className={selectedSymbol === 'times' ? 'selected' : ''}
                >
                  <FaTimes style={styles.symbolIcon} />
                </div>
                <div
                  style={styles.symbolButton}
                  onClick={() => handleSelectSymbol('exclamation')}
                  className={selectedSymbol === 'exclamation' ? 'selected' : ''}
                >
                  <FaExclamationCircle style={styles.symbolIcon} />
                </div>
              </div>
            </div>
          ))}

          

      {!authState.isAdmin && (
            <div style={styles.buttonContainer}>
              <button 
                type="button" 
                onClick={handleAddRow} 
                style={styles.addButton}
              >
                Add Extra Forum
              </button>
              <button 
                type="submit" 
                style={styles.submitButton}
              >
                Submit Forum
              </button>
            </div>
          )}
        </form>
      )}

      <TextModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveNote}
        value={forumRows[currentRowIndex]?.note || ''}
      />
    </div>
  );
};



const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
    
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '95%',
    height: "50%"
  },

  forumName: {
    textAlign: 'center',   // Centers the text horizontally
    marginTop: '0',         // Reset the top margin to align it at the top
    paddingTop: '20px',     // Adjust space from the top; increase or decrease as needed
    fontSize: '1.5em',      // Font size of the forum name
    position: 'relative',   // Enable positioning for alignment
    top: 0,                 // Aligns it to the top of the container
  },

 

  row: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: '30px',   // Adjust the space between rows (vertical spacing)
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',  
    border: '1px solid #ddd',   
    borderRadius: '8px',        
    padding: '20px',           // Optional: Increase the padding inside each row for more spacing
  },
  titleInput: {
    flex: 1,
    padding: '10px',
    marginRight: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    
  },
  iconText: {
    cursor: 'pointer',
    marginLeft: '200px',
  },
  icon: {
    fontSize: '20px',
    color: '#555',
    marginLeft: '-120px'
    // marginRight: '-px'
  },
  removeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'red',
    fontSize: '20px',
    // marginLeft: '-40px',
    // marginTop: '10px'

  },

  // removeButton: {
  //   background: 'none',
  //   border: 'none',
  //   cursor: 'pointer',
  //   color: 'red',
  //   fontSize: '20px',
  //   position: 'absolute',   // Positioning it absolutely within the container
  //   top: '160px',            // Distance from the top of the container
  //   right: '80px',          // Distance from the right side of the container
  // },
  

  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: '20px',
  },
  addButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    width: '300px',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  modalActions: {
    marginTop: '10px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  modalSaveButton: {
    padding: '8px 12px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  modalCloseButton: {
    padding: '8px 12px',
    backgroundColor: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  imagesContainer: {
    marginTop: '10px',
  },
  imagesList: {
    listStyle: 'none',
    padding: '0',
  },
  imageItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '5px',
  },
  image: {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    marginRight: '10px',
  },
  symbolContainer: {
    display: 'flex',
    marginLeft: '10px',
    
  },
  symbolButton: {
    padding: '5px',
    cursor: 'pointer',
    // marginLeft: '5px',
    marginRight: '-5px'
  //  background: 'pink',
  
  },
 
  

  symbolIcon: {
    fontSize: '20px',
    color: '#007BFF',
  },
};

export default ForumForm;



