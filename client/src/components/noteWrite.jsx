// In client/src/components/NoteWrite.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

import ReactMarkdown from 'react-markdown';

import { useTimeMachine } from './contexts/timeMachineContext';

import Header from './partials/header';
import Footer from './partials/footer';



const NoteWrite = () => {
    axios.defaults.withCredentials = true;
    // const [title, setTitle] = useState('');
    // const [content, setContent] = useState('');
    // const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');

    const { id } = useParams(); // Get the note ID from the URL if it exists
    const navigate = useNavigate();
    const [cookies] = useCookies(['user']);
    const { timeMachineDate } = useTimeMachine();

    const [note, setNote] = useState({
        title: '',
        content: '',
        categories: [],
        createdAt: new Date(timeMachineDate),
        updatedAt: new Date(timeMachineDate),
        user: cookies.user.id
    });

    // If there's an ID, we're editing an existing note
    useEffect(() => {
        if (id) {
            // Fetch the note data if editing an existing note
            axios.get(`http://localhost:5000/api/notes/${id}`)
                .then(response => {
                    setNote({
                        ...response.data,
                        //updatedAt: timeMachineDate
                    });
                })
                .catch(error => console.error('Error fetching note:', error));
        }
    }, [id]);

    // Submit form
    const handleSave = async (e) => {
        e.preventDefault();
        if (id) {
          // Update existing note
          await axios.put(`http://localhost:5000/api/notes/write/${id}`, {
            ...note,
            updatedAt: new Date(timeMachineDate) // Update the last updated date
          });
        } else {
          // Create new note
          await axios.post('http://localhost:5000/api/notes/write', note);
        }
        navigate('/notes');
    };

    /* CATEGORY HANDLING */

    // Add new category. Also checks if it's not empty or already exists
    const handleAddCategory = () => {
        if (newCategory && !note.categories.includes(newCategory)) {
            setNote({
                ...note,
                categories: [...note.categories, newCategory]
            });
            setNewCategory('');
        }
        else if (!newCategory) {
            alert('Category cannot be empty');
        }
        else {
            alert('Category already exists');
        }
    };

    // Removes a category
    const handleRemoveCategory = (category) => {
        setNote({
            ...note,
            categories: note.categories.filter(cat => cat !== category)
        });
    };

    return (
        <>
        <Header />
        <div className="container mt-5">
            <h2>{id ? 'Edit Note' : 'Create New Note'}</h2>
            <form onSubmit={handleSave}>
            <div className="mb-3">
                <label htmlFor="title" className="form-label">Title</label>
                <input type="text" className="form-control" id="title" value={note.title}
                    onChange={e => setNote({...note, title: e.target.value})} required />
            </div>
            <div className="mb-3">
                <label htmlFor="content" className="form-label">Content</label>
                <textarea className="form-control" id="content" rows="5" value={note.content}
                    onChange={e => setNote({...note, content: e.target.value})} required></textarea>
            </div>
            
            <div className="mb-3">
                <label htmlFor="newCategory" className="form-label d-flex align-items-center">
                    Add Category:
                    <div className="input-group w-25 ms-2">
                        <input type="text" className="form-control" id="newCategory" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
                        <button type="button" className="btn btn-secondary" onClick={handleAddCategory}>+</button>
                    </div>
                </label>
                <div className="mt-2 d-flex flex-wrap">
                    {note.categories.map((category, index) => (
                        <span key={index} className="badge bg-primary m-1 d-flex align-items-center text-wrap text-break">
                            {category}
                            <button type="button" className="btn-close btn-close-white ms-2" aria-label="Remove" onClick={() => handleRemoveCategory(category)}></button>
                        </span>
                    ))}
                </div>
            </div>

            <h3 className="form-label mt-4">Preview</h3>
            <div className="form-control text-wrap text-break">
                <ReactMarkdown>{note.content}</ReactMarkdown>
            </div>
            { /* <div className="form-control" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(content)) }} /> */}

            <button type="submit" className="btn btn-primary mt-3 mb-5">{id ? 'Update' : 'Create'}</button>
            </form>
        </div>
        <Footer />
        </>
    );
};

export default NoteWrite;