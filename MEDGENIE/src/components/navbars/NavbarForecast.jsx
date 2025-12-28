import { Link } from "react-router-dom";

const NavbarForecast = () => {
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 px-6 flex justify-center gap-10 font-semibold shadow-xl">
      <Link to="/forecast" className="hover:text-yellow-300">Forecast</Link>
      <Link to="/crop" className="hover:text-yellow-300">Crop AI</Link>
      <Link to="/outbreak" className="hover:text-yellow-300">Outbreak</Link>
      <Link to="/imd" className="hover:text-yellow-300">IMD Live</Link>
      <Link to="/maps" className="hover:text-yellow-300">Maps</Link>
    </nav>
  );
};

export default NavbarForecast;
