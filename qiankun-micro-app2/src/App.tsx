import React from "react"
import logo from "./logo.svg"
import "./App.css"
import { Routes, Route, Link } from "react-router-dom"
import Mila from "./pages/Mila"
import Malena from "./pages/Malena"

function App() {
  return (
    <div className="App">
      <Link to={"/"}>home</Link> |<Link to={"/mila"}>micro-app2 mila</Link> |
      <Link to={"/malena"}>micro-app2 malena</Link>
      <Routes>
        <Route path="/mila" element={<Mila />} />
        <Route path="/malena" element={<Malena />} />
      </Routes>
    </div>
  )
}

export default App
