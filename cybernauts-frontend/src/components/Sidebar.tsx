// src/components/Sidebar.tsx
import { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../app/store';
import { createUser } from '../features/graph/graphSlice';
import { useDebounce } from '../hooks/useDebounce';
import { ActionCreators as UndoActionCreators } from 'redux-undo';
import './Sidebar.css';

const Sidebar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { nodes } = useSelector((state: RootState) => state.graph.present); // Update selector
  const canUndo = useSelector((state: RootState) => state.graph.past.length > 0);
  const canRedo = useSelector((state: RootState) => state.graph.future.length > 0);
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [hobbySearch, setHobbySearch] = useState('');
  
  // Use debounce for hobby search to optimize performance
  const debouncedSearch = useDebounce(hobbySearch, 300);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !age) {
        alert('Username and age are required.');
        return;
    }
    const hobbiesArray = hobbies.split(',').map(h => h.trim().toLowerCase()).filter(h => h);
    dispatch(createUser({ username, age: Number(age), hobbies: hobbiesArray }));

    // Reset form
    setUsername('');
    setAge('');
    setHobbies('');
  };

  const allHobbies = useMemo(() => {
    const hobbySet = new Set<string>();
    nodes.forEach(node => {
      node.data.hobbies.forEach((hobby: string) => {
        const cleanedHobby = hobby.trim().toLowerCase();
        if (cleanedHobby) {
          hobbySet.add(cleanedHobby);
        }
      });
    });
    return Array.from(hobbySet).sort();
  }, [nodes]);

  // Use debounced search value for filtering
  const filteredHobbies = useMemo(() => 
    allHobbies.filter(hobby => 
      hobby.toLowerCase().includes(debouncedSearch.toLowerCase())
    ), [allHobbies, debouncedSearch]
  );

  const onDragStart = (event: React.DragEvent, hobby: string) => {
    event.dataTransfer.setData('application/reactflow', hobby);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleUndo = () => {
    dispatch(UndoActionCreators.undo());
  };

  const handleRedo = () => {
    dispatch(UndoActionCreators.redo());
  };

  return (
    <aside className="sidebar">
      <div className="history-controls">
        <button onClick={handleUndo} disabled={!canUndo}>Undo</button>
        <button onClick={handleRedo} disabled={!canRedo}>Redo</button>
      </div>
      <h2>User Management</h2>
      <form onSubmit={handleSubmit} className="user-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required
          min="1"
          max="150"
        />
        <input
          type="text"
          placeholder="Hobbies (comma-separated)"
          value={hobbies}
          onChange={(e) => setHobbies(e.target.value)}
        />
        <button type="submit">Create User</button>
      </form>
      
      <div className="hobbies-section">
        <h3>Hobbies ({filteredHobbies.length})</h3>
        <input
          type="text"
          placeholder="Search hobbies..."
          className="hobby-search"
          value={hobbySearch}
          onChange={(e) => setHobbySearch(e.target.value)}
        />
        <div className="hobbies-list">
          {filteredHobbies.length > 0 ? (
            filteredHobbies.map((hobby) => (
              <div
                key={hobby}
                className="hobby-item"
                onDragStart={(event) => onDragStart(event, hobby)}
                draggable
              >
                {hobby}
              </div>
            ))
          ) : (
            <p style={{ fontSize: '0.9em', color: '#999', marginTop: '10px' }}>
              {hobbySearch ? 'No hobbies found' : 'No hobbies yet'}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;