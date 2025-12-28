import { Link } from "react-router-dom";
const NavbarCore = () => {
  return (
    <nav className="bg-white shadow-lg py-4 px-6 flex justify-center gap-10 text-gray-900 font-semibold">
      <Link to="/" className="hover:text-purple-600">Dashboard</Link>
      <Link to="/cyborg" className="...">Cyborg Demo</Link>

      <Link to="/chat" className="hover:text-purple-600">AI Chat</Link>
      <Link to="/upload" className="hover:text-purple-600">Uploads</Link>
      <Link to="/video" className="hover:text-purple-600">Video AI</Link>
    </nav>
  );
};

export default NavbarCore;
