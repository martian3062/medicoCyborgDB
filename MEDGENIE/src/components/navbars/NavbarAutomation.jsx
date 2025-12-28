import { Link } from "react-router-dom";

const NavbarAutomation = () => {
  return (
    <nav className="bg-gradient-to-r from-green-600 to-green-800 text-white py-4 px-6 flex justify-center gap-10 font-semibold shadow-xl">
      <Link to="/alerts" className="hover:text-black">Alerts</Link>
      <Link to="/webhooks" className="hover:text-black">Webhooks</Link>
      <Link to="/training" className="hover:text-black">Training</Link>
      <Link to="/analytics" className="hover:text-black">Analytics</Link>
    </nav>
  );
};

export default NavbarAutomation;
