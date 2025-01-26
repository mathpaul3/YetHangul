import RouteChangeTracker from "@/RouteChangeTracker";
import { Route, Routes } from "react-router-dom";
import Landing from "@/Landing";

function App() {
  RouteChangeTracker();
  return (
    <div id="app">
      <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
    </div>
  );
}

export default App;
