const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="cursor-pointer p-6 rounded-2xl bg-white dark:bg-[#1e1b4b] shadow-mg-soft 
      hover:shadow-mg transition-all border border-gray-200 dark:border-gray-700 flex flex-col gap-4">

      <div className="text-4xl">{icon}</div>

      <h3 className="text-xl font-bold">{title}</h3>

      <p className="text-gray-600 dark:text-gray-300 text-sm">
        {description}
      </p>
    </div>
  );
};

export default FeatureCard;
