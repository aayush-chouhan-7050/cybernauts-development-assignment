// src/components/Sidebar.tsx
import { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../app/store';
import { createUser } from '../features/graph/graphSlice'; // We'll create this next
import './Sidebar.css';

const Sidebar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { nodes } = useSelector((state: RootState) => state.graph); // Get nodes from state
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [hobbySearch, setHobbySearch] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !age) {
        alert('Username and age are required.');
        return;
    }
    const hobbiesArray = hobbies.split(',').map(h => h.trim()).filter(h => h);
    dispatch(createUser({ username, age: Number(age), hobbies: hobbiesArray }));

    // Reset form
    setUsername('');
    setAge('');
    setHobbies('');
  };

  const allHobbies = useMemo(() => {
  const hobbySet = new Set<string>();
  nodes.forEach(node => {
    node.data.hobbies.forEach(hobby => {
      const cleanedHobby = hobby.trim().toLowerCase(); // Sanitize the hobby
      if (cleanedHobby) { // Ensure it's not an empty string
        hobbySet.add(cleanedHobby);
      }
    });
  });
  return Array.from(hobbySet);
  }, [nodes]);

  const filteredHobbies = allHobbies.filter(hobby => 
    hobby.toLowerCase().includes(hobbySearch.toLowerCase())
  );

  // Drag handler for hobbies
  const onDragStart = (event: React.DragEvent, hobby: string) => {
    event.dataTransfer.setData('application/reactflow', hobby);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="sidebar">
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
        />
        <input
          type="text"
          placeholder="Hobbies (comma-separated)"
          value={hobbies}
          onChange={(e) => setHobbies(e.target.value)}
        />
        <button type="submit">Create User</button>
      </form>
    {/* --- Draggable Hobbies Section --- */}
      <div className="hobbies-section">
        <h3>Hobbies</h3>
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search hobbies..."
          className="hobby-search" // Add a class for styling
          value={hobbySearch}
          onChange={(e) => setHobbySearch(e.target.value)}
        />
        <div className="hobbies-list">
          {filteredHobbies.map((hobby) => (
            <div
              key={hobby}
              className="hobby-item"
              onDragStart={(event) => onDragStart(event, hobby)}
              draggable
            >
              {hobby}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;