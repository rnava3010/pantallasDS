// manager/src/main.jsx
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter basename="/manager">
    <App />
  </BrowserRouter>
);