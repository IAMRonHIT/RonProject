// Sample Python code to display (as a string)
const sampleCode = `
<span class="text-[#60a5fa] font-semibold"># Ron AI Agentic Framework</span>
<span class="text-[#60a5fa] font-semibold"># A modular, orchestrated approach</span>

<span class="text-[#60a5fa] font-semibold"># Base class for all agents</span>
<span class="text-[#c084fc] font-semibold">class</span> <span class="text-[#34d399]">RonAgent</span>:
    <span class="text-[#c084fc] font-semibold">def</span> <span class="text-[#f59e0b]">__init__</span>(<span class="text-[#94a3b8]">self</span>, <span class="text-[#94a3b8]">name</span>):
        <span class="text-[#94a3b8]">self</span>.name = <span class="text-[#94a3b8]">name</span>

    <span class="text-[#c084fc] font-semibold">def</span> <span class="text-[#f59e0b]">perform_task</span>(<span class="text-[#94a3b8]">self</span>, <span class="text-[#94a3b8]">data</span>):
        <span class="text-[#c084fc] font-semibold">raise</span> <span class="text-[#ef4444]">NotImplementedError</span>(<span class="text-[#22d3ee]">"Each agent must implement its own task"</span>)


<span class="text-[#60a5fa] font-semibold"># Specialized agent for Patient Management</span>
<span class="text-[#c084fc] font-semibold">class</span> <span class="text-[#34d399]">PatientManagementAgent</span>(<span class="text-[#34d399]">RonAgent</span>):
    <span class="text-[#c084fc] font-semibold">def</span> <span class="text-[#f59e0b]">perform_task</span>(<span class="text-[#94a3b8]">self</span>, <span class="text-[#94a3b8]">patient_data</span>):
        <span class="text-[#60a5fa] font-semibold"># Logic for patient registration, updating profiles, and managing patient history</span>
        <span class="text-[#c084fc] font-semibold">return</span> <span class="text-[#22d3ee]">f"Managing patient data for {</span><span class="text-[#94a3b8]">patient_data</span>[<span class="text-[#22d3ee]">'patient_id'</span>]<span class="text-[#22d3ee]">}"</span>


<span class="text-[#60a5fa] font-semibold"># Specialized agent for Clinical Decision Support</span>
<span class="text-[#c084fc] font-semibold">class</span> <span class="text-[#34d399]">ClinicalDecisionAgent</span>(<span class="text-[#34d399]">RonAgent</span>):
    <span class="text-[#c084fc] font-semibold">def</span> <span class="text-[#f59e0b]">perform_task</span>(<span class="text-[#94a3b8]">self</span>, <span class="text-[#94a3b8]">clinical_data</span>):
        <span class="text-[#60a5fa] font-semibold"># Logic for analyzing clinical data and providing decision support</span>
        <span class="text-[#c084fc] font-semibold">return</span> <span class="text-[#22d3ee]">f"Clinical decision support analysis complete for case {</span><span class="text-[#94a3b8]">clinical_data</span>[<span class="text-[#22d3ee]">'case_id'</span>]<span class="text-[#22d3ee]">}"</span>


<span class="text-[#60a5fa] font-semibold"># Specialized agent for Billing and Claims</span>
<span class="text-[#c084fc] font-semibold">class</span> <span class="text-[#34d399]">BillingClaimsAgent</span>(<span class="text-[#34d399]">RonAgent</span>):
    <span class="text-[#c084fc] font-semibold">def</span> <span class="text-[#f59e0b]">perform_task</span>(<span class="text-[#94a3b8]">self</span>, <span class="text-[#94a3b8]">billing_data</span>):
        <span class="text-[#60a5fa] font-semibold"># Logic for handling billing, claims submission, and adjudication</span>
        <span class="text-[#c084fc] font-semibold">return</span> <span class="text-[#22d3ee]">f"Processed billing claim for service ID {</span><span class="text-[#94a3b8]">billing_data</span>[<span class="text-[#22d3ee]">'service_id'</span>]<span class="text-[#22d3ee]">}"</span>
`

function HowWeDoItSection() {
  return (
    <section className="relative w-full bg-gradient-to-br from-[#050818] to-[#10142a] py-16 md:py-24 overflow-hidden text-white">
      {/* Optional: Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle at 70% 50%, rgba(0, 229, 224, 0.15) 0%, transparent 60%)",
        }}
      ></div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          {/* Left side - Text Content */}
          <div className="w-full lg:w-2/5 flex flex-col items-start text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              How <span className="text-[#00E5E0]">We Do It</span>
            </h2>
            <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-xl mx-auto lg:mx-0">
              Our AI Agentic Framework orchestrates specialized agents that work together to automate complex healthcare
              workflows, ensuring seamless coordination.
            </p>
            <button className="px-8 py-3 bg-[#00E5E0] text-[#050818] font-semibold rounded-lg hover:bg-opacity-90 transition-colors shadow-md mx-auto lg:mx-0">
              Learn More
            </button>
          </div>

          {/* Right side - Simplified Code Window */}
          <div className="w-full lg:w-3/5">
            <div className="bg-[#161B22]/80 backdrop-blur-md border border-[#30363D]/60 rounded-lg shadow-2xl overflow-hidden">
              {/* Code Window Header (Simplified) */}
              <div className="flex items-center px-4 py-2 bg-[#161B22]/90 border-b border-[#30363D]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                </div>
                <div className="ml-4 text-sm text-gray-400 bg-gray-700/50 px-3 py-0.5 rounded">
                  agentic_framework.py
                </div>
              </div>

              {/* Code Area */}
              <div className="p-4 sm:p-6 text-sm overflow-x-auto">
                <pre className="text-gray-300">
                  <code
                    className="font-mono whitespace-pre"
                    dangerouslySetInnerHTML={{ __html: sampleCode.trim() }}
                  ></code>
                </pre>
              </div>
            </div>
            {/* Optional subtle glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#0FA0CE]/10 via-[#33C3F0]/10 to-[#9b87f5]/10 opacity-75 blur-xl group-hover:opacity-100 transition duration-500 rounded-lg -z-10 pointer-events-none"></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowWeDoItSection

