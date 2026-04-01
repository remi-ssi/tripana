export default function ProgressBar({ currentStep }) {
  const steps = ["Trip Plan", "Attractions", "Preference", "Break", "Summary"];

  return (
    <div className="flex justify-between items-center px-8 py-4 bg-gray-50 border-b border-gray-200">
      {steps.map((step, idx) => (
        <div key={idx} className="flex-1 text-center">
          <div
            className={`text-sm font-medium ${
              idx === currentStep ? "text-blue-700" : "text-gray-500"
            }`}
          >
            {step}
          </div>
          {idx < steps.length - 1 && (
            <div className="h-0.5 bg-gray-300 mx-auto mt-2 w-3/4"></div>
          )}
        </div>
      ))}
    </div>
  );
}