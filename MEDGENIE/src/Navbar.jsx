import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="w-full py-4 px-8 bg-[#111827] text-white flex justify-between items-center fixed top-0 z-50">
      <div className="text-2xl font-bold">MEDGENIE</div>
      <div className="space-x-6 text-lg">
        <Link to="/" className="hover:text-blue-400">Home</Link>
        <Link to="/dashboard" className="hover:text-blue-400">Dashboard</Link>
        <Link to="/chat" className="hover:text-blue-400">ChatBot</Link>
        <Link to="/video" className="hover:text-blue-400">Video Conf</Link>
        <Link to="/upload" className="hover:text-blue-400">Image Transfer</Link>
      </div>
    </nav>
  );
};

export default Navbar;
