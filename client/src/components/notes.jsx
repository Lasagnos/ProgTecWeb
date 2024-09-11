import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import config from './utilities/config';
import { useNavigate } from 'react-router-dom';

import { useTimeMachine } from './contexts/timeMachineContext';
import ReactMarkdown from 'react-markdown';
import { truncateContent, truncateCategories, formatDate } from './utilities/utilityFunctions';

import Footer from './partials/footer';
import Header from './partials/header';


const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [sortCriteria, setSortCriteria] = useState('lastModified'); //default sort criteria
  const [sortOrder, setSortOrder] = useState('desc');
  const navigate = useNavigate();
  const { timeMachineDate } = useTimeMachine();


  // Sorting logic. Done as callback to sort in the beginning. Passing notes manually to avoid infinite loop.
  const handleSort = useCallback((criteria, order, notesToSort) => {
    setSortCriteria(criteria);
    setSortOrder(order);
    let sortedNotes = [...notesToSort];
    switch (criteria) {
      case 'title':
        sortedNotes.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'lastModified':
        sortedNotes.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
        break;
      case 'contentLength':
        sortedNotes.sort((a, b) => a.content.length - b.content.length);
        break;
      default:
        break;
    }

    if (order === 'desc') {
      sortedNotes.reverse();
    }

    setNotes(sortedNotes);
  }, []);


  // Load notes on component mount
  useEffect(() => {
    axios.defaults.withCredentials = true;
    axios.get(`${config.apiBaseUrl}/notes`)
      .then(res => {
        // Fetches the notes and sorts them automatically
        handleSort(sortCriteria, sortOrder, res.data);
      })
      .catch(error => console.error('Error fetching notes:', error));
  }, [handleSort, sortCriteria, sortOrder]);


  /* MAIN HANDLERS */

  const handleCreateNew = () => {
    navigate('/notes/write');
  };

  const handleModify = (id) => {
    navigate(`/notes/write/${id}`);
  };

  // Duplicates a note. Timestamps are separate.
  const handleDuplicate = (note) => {
    axios.post(`${config.apiBaseUrl}/notes/write`, { ...note, _id: undefined })
        .then(response => {
            const clonedNote = response.data;
            //clonedNote._id = undefined;
            clonedNote.createdAt = new Date(timeMachineDate);
            clonedNote.updatedAt = new Date(timeMachineDate);
            const updatedNotes = [...notes, clonedNote];
            setNotes(updatedNotes); // Add the duplicated note to the state
            handleSort(sortCriteria, sortOrder, updatedNotes);
        })
        .catch(error => console.error('Error duplicating note:', error));
  };

  // Deletes the note
  const handleDelete = (id) => {
    axios.delete(`${config.apiBaseUrl}/notes/${id}`)
      .then(() => {
        setNotes(notes.filter(note => note._id !== id)); // Remove the deleted note from the state
        //handleSort(sortCriteria, sortOrder, notes);
      })
      .catch(error => console.error('Error deleting note:', error));
  };


  // Toggle the sort direction (asc/desc)
  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    handleSort(sortCriteria, newOrder, notes);
  };


  return (
    <>
      <Header />
      <div className="container mt-5">

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
          <button className="btn btn-primary mb-2 mb-md-0" onClick={handleCreateNew}>
            <i className="fa fa-plus" aria-hidden="true"></i> Create Note
          </button>
          
          <div className="d-flex align-items-center">
            <label htmlFor="sortCriteria" className="form-label me-2">Sort By:</label>
            <div className="btn-group">
              <select id="sortCriteria" className="form-select form-select-sm" value={sortCriteria} onChange={e => handleSort(e.target.value, sortOrder, notes)}>
                <option value="lastModified">Last Modified</option>
                <option value="title">Title</option>
                <option value="contentLength">Content Length</option>
              </select>
              <button className="btn btn-secondary btn-sm" onClick={toggleSortOrder}>
                {sortOrder === 'asc' ? <i className="fa fa-arrow-up" aria-hidden="true"></i> : <i className="fa fa-arrow-down" aria-hidden="true"></i>}
              </button>
            </div>
          </div>
        </div>

        {notes.map(note => (
          <div key={note._id} className="card mb-3">
            <div className="card-body">
              <h4 className="card-title">{note.title}</h4>
              <hr className="my-3" style={{ borderColor: 'gray' }} />
              <div className="card-text">
                <ReactMarkdown>{truncateContent(note.content, 250)}</ReactMarkdown>
              </div>
              <hr className="my-3" style={{ borderColor: 'gray' }} />
              <small className="text-muted">Categories: {truncateCategories(note.categories, 150)}</small>
              <hr className="my-3" style={{ borderColor: 'gray' }} />

              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                <div className="btn-group mb-2 mb-md-0">
                  <button className="btn btn-primary mr-2" onClick={() => handleModify(note._id)}>Open</button>
                  <button className="btn btn-secondary mr-2" onClick={() => handleDuplicate(note)}>Duplicate</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(note._id)}>Delete</button>
                </div>
                <small className="text-muted text-center text-md-right">
                  Created on: {formatDate(note.createdAt)}, Last updated: {formatDate(note.updatedAt)}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </>
  );
};

export default Notes;