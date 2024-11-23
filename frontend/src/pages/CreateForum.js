// import React, { useState } from 'react';
// import axios from 'axios';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const CreateForum = () => {
//   const [forumName, setForumName] = useState('');
//   const [fields, setFields] = useState([{ name: '', type: 'text' }]);
//   const [submitting, setSubmitting] = useState(false);

//   const addField = () => {
//     setFields([...fields, { name: '', type: 'text' }]);
//   };

//   const handleFieldChange = (index, key, value) => {
//     const updatedFields = [...fields];
//     updatedFields[index][key] = value;
//     setFields(updatedFields);
//   };

//   const removeField = (index) => {
//     setFields(fields.filter((_, i) => i !== index));
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setSubmitting(true);

//     const token = localStorage.getItem('token'); // Assuming token is stored here
//     const forumData = {
//       forumName,
//       fields,
//     };

//     try {
//       const response = await axios.post('http://localhost:5000/api/forums/create', forumData, {
//         headers: {
//           Authorization: `Bearer ${token}`, // Pass the token to identify the user
//           'Content-Type': 'application/json',
//         },
//       });
//       toast.success('Forum created successfully');
//       setForumName('');
//       setFields([{ name: '', type: 'text' }]);
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Error creating forum');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="create-forum-container">
//       <ToastContainer />
//       <h1>Create New Forum</h1>
//       <form onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label>Forum Name:</label>
//           <input
//             type="text"
//             value={forumName}
//             onChange={(e) => setForumName(e.target.value)}
//             placeholder="Enter forum name"
//             required
//           />
//         </div>

//         <h2>Custom Fields</h2>
//         {fields.map((field, index) => (
//           <div key={index} className="field-group">
//             <input
//               type="text"
//               placeholder="Field Name"
//               value={field.name}
//               onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
//               required
//             />
//             <select
//               value={field.type}
//               onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
//             >
//               <option value="text">Text</option>
//               <option value="number">Number</option>
//               <option value="email">Email</option>
//               <option value="date">Date</option>
//               <option value="checkbox">Checkbox</option>
//             </select>
//             <button type="button" onClick={() => removeField(index)}>
//               Remove
//             </button>
//           </div>
//         ))}

//         <button type="button" onClick={addField} className="btn btn-add-field">
//           Add Field
//         </button>
//         <button type="submit" className="btn btn-create-forum" disabled={submitting}>
//           {submitting ? 'Creating...' : 'Create Forum'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default CreateForum;
import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './bootstrap.min.css';

const CreateForum = () => {
  const [forumName, setForumName] = useState('');
  const [fields, setFields] = useState([{ name: '', type: 'text' }]);
  const [submitting, setSubmitting] = useState(false);

  const addField = () => {
    setFields([...fields, { name: '', type: 'text' }]);
  };

  const handleFieldChange = (index, key, value) => {
    const updatedFields = [...fields];
    updatedFields[index][key] = value;
    setFields(updatedFields);
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    const token = localStorage.getItem('token');
    const forumData = {
      forumName,
      fields,
    };

    try {
      await axios.post('http://localhost:5000/api/forums/create', forumData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      toast.success('Forum created successfully!');
      setForumName('');
      setFields([{ name: '', type: 'text' }]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating forum');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <ToastContainer />
      <div className="card mx-auto p-4 shadow-sm" style={{ maxWidth: '600px' }}>
        <h2 className="text-center mb-4">Create New Forum</h2>
        <form onSubmit={handleSubmit}>
          {/* Forum Name */}
          <div className="mb-3">
            <label className="form-label">Forum Name</label>
            <input
              type="text"
              className="form-control"
              value={forumName}
              onChange={(e) => setForumName(e.target.value)}
              placeholder="Enter forum name"
              required
            />
          </div>

          {/* Custom Fields */}
          <div className="mb-3">
            <h4 className="mb-3">Custom Fields</h4>
            {fields.map((field, index) => (
              <div key={index} className="d-flex mb-2">
                <input
                  type="text"
                  className="form-control me-2"
                  placeholder="Field Name"
                  value={field.name}
                  onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                  required
                />
                <select
                  className="form-select me-2"
                  value={field.type}
                  onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="email">Email</option>
                  <option value="date">Date</option>
                  <option value="checkbox">Checkbox</option>
                </select>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => removeField(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addField}
              className="btn btn-secondary"
            >
              + Add Field
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={submitting}
          >
            {submitting ? 'Creating...' : 'Create Forum'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateForum;
