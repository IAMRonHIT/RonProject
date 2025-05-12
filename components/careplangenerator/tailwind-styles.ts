// Reusable Tailwind CSS classes for Ron AI Care Plan Template
// These classes maintain the schema integrity while improving UI consistency

// Section headings
export const sectionHeading = {
  container: "pl-4 bg-slate-800 py-3 mb-6",
  iconContainer: "ml-3 mr-4", // Add appropriate color in component (e.g. text-cyan-400)
  textWrapper: "text-xl font-semibold text-slate-100 flex items-center"
};

// Icon colors by section type
export const iconColors = {
  subjective: "text-cyan-400",
  objective: "text-emerald-400",
  diagnosis: "text-purple-400",
  medications: "text-purple-400",
  vitals: "text-cyan-400",
  treatments: "text-teal-400",
  nursing: "text-teal-400",
  goals: "text-purple-400",
  interventions: "text-teal-400",
  evaluation: "text-amber-400",
  sources: "text-cyan-400",
  agent: "text-blue-400"
};

// Card styling
export const cardStyles = {
  base: "bg-slate-700 rounded-xl p-6 shadow-lg border border-slate-600",
  vitals: "bg-slate-700 p-4 my-2 rounded-xl border border-slate-600 text-center shadow-md",
  hover: "hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
};

// Lists and spacing
export const listStyles = {
  container: "space-y-4 mx-2",
  item: "flex items-start gap-3 py-2"
};

// Component sections
export const componentStyles = {
  wrapper: "space-y-8",
  subsection: "pt-6 border-t border-slate-600"
};

// Usage example in the component:
/*
import { sectionHeading, iconColors } from './tailwind-styles';

// Then in JSX:
<div className={sectionHeading.container}>
  <h3 className={sectionHeading.textWrapper}>
    <div className={`${iconColors.subjective} ${sectionHeading.iconContainer}`}>
      <User size={20} />
    </div>
    <span>Subjective Data</span>
  </h3>
</div>
*/
