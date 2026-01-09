const API_URL = 'http://localhost:5000/api/notes';

const getNotes = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch notes');
    return await response.json();
  } catch (err) {
    console.error(err.message);
  }
};

const addNote = async (userId, content) => {
  try {
    const response = await fetch(`${API_URL}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, content })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.msg || 'Failed to add note');
    }
    
    return data;
  } catch (err) {
    console.error(err.message);
    alert(err.message);
  }
};

const updateNote = async (id, content) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    if (!response.ok) throw new Error('Failed to update note');
    return await response.json();
  } catch (err) {
    console.error(err.message);
  }
};

const deleteNote = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete note');
    return await response.json();
  } catch (err) {
    console.error(err.message);
  }
};