import { Routes, Route } from 'react-router-dom';
import TaskListPage from './components/TaskListPage';
import NotFound from './components/NotFound';
import HomePage from './components/HomePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tasks" element={<TaskListPage />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}

export default App;
