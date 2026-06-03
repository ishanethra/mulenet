import re

with open("app/page.tsx", "r") as f:
    content = f.read()

# 1. Update Investigator Notes
old_notes = """                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Investigator Notes</label>
                    <textarea 
                      className="w-full bg-black/40 border border-white/10 rounded-md p-2 text-xs text-slate-300 min-h-[60px] focus:outline-none focus:border-teal-500/50 resize-none"
                      placeholder="Enter findings here..."
                    />
                  </div>"""

new_notes = """                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">AI-Generated Case Notes</label>
                    <textarea 
                      className="w-full bg-black/40 border border-white/10 rounded-md p-2 text-xs text-slate-300 min-h-[90px] focus:outline-none focus:border-teal-500/50 resize-none leading-relaxed"
                      value={`[AUTO-DRAFTED BY MULENET]\\nAccount ${selectedAccount.id} flagged with Critical Risk Score (${activeRiskProfile.score ?? selectedAccount.score}/100).\\nPrimary drivers: ${(activeRiskProfile.top_reasons || []).join(", ") || selectedAccount.typology}.\\nNetwork Analysis: Linked to ${gnnData?.summary?.node_count || 6} entities across ${gnnData?.summary?.communities || 4} high-risk clusters.\\nRecommendation: Freeze funds and file SAR.`}
                      readOnly
                    />
                  </div>"""

content = content.replace(old_notes, new_notes)

# 2. Update FeatureExplainer to be a tooltip
old_explainer = """function FeatureExplainer({ text, onDismiss }: { text: string, onDismiss?: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
      animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className="rounded-lg border border-teal-500/20 bg-teal-500/5 p-3 flex gap-3 items-start relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-teal-500/50" />
      <Info className="size-4 text-teal-400 shrink-0 mt-0.5" />
      <p className="text-xs text-slate-300 leading-relaxed pr-6">{text}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="absolute top-2.5 right-2.5 text-slate-500 hover:text-slate-300 transition-colors">
          <X className="size-3.5" />
        </button>
      )}
    </motion.div>
  );
}"""

new_explainer = """function FeatureExplainer({ text }: { text: string }) {
  return (
    <div className="group relative ml-2 inline-flex items-center">
      <Info className="size-[14px] text-teal-500/60 hover:text-teal-400 cursor-help transition-colors" />
      <div className="pointer-events-none absolute bottom-full left-1/2 z-[100] mb-2 w-56 -translate-x-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="rounded-lg border border-teal-500/30 bg-slate-900 p-2.5 text-xs font-normal text-slate-300 shadow-xl leading-relaxed backdrop-blur-md">
          {text}
        </div>
        <div className="absolute left-1/2 top-full -mt-[1px] h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-teal-500/30 bg-slate-900"></div>
      </div>
    </div>
  );
}"""

content = content.replace(old_explainer, new_explainer)

# Remove all AnimatePresence blocks containing FeatureExplainers
content = re.sub(r'<AnimatePresence>\s*\{showExplainers && <FeatureExplainer text="([^"]+)" onDismiss=\{\(\) => setShowExplainers\(false\)\} />\}\s*</AnimatePresence>', '', content)

# Inject them directly into CardTitles
content = content.replace(
    '<CardTitle className="text-white flex items-center gap-2"><List size={18} className="text-teal-400"/> Alert Priority Queue</CardTitle>',
    '<CardTitle className="text-white flex items-center gap-2"><List size={18} className="text-teal-400"/> Alert Priority Queue {showExplainers && <FeatureExplainer text="This is your main inbox. Our AI scans thousands of accounts to find the most suspicious ones and ranks them here from most dangerous to least. Click on any account to see exactly why it was flagged." />}</CardTitle>'
)

content = content.replace(
    '<CardTitle className="text-white flex items-center gap-2"><Shield size={18} className="text-teal-400"/> Risk DNA</CardTitle>',
    '<CardTitle className="text-white flex items-center gap-2"><Shield size={18} className="text-teal-400"/> Risk DNA {showExplainers && <FeatureExplainer text="Every criminal has a specific \'fingerprint\'. This chart breaks down exactly how the account is misbehaving. For example, is it moving money too fast (Velocity) or acting completely differently than normal customers (Behavior)?" />}</CardTitle>'
)

content = content.replace(
    '<CardTitle className="text-white flex items-center gap-2"><Bot size={18} className="text-teal-400"/> Investigator Copilot</CardTitle>',
    '<CardTitle className="text-white flex items-center gap-2"><Bot size={18} className="text-teal-400"/> Investigator Copilot {showExplainers && <FeatureExplainer text="Meet your AI Assistant. Instead of staring at raw numbers, this assistant reads the charts for you and explains in simple English exactly why this account looks like a money mule." />}</CardTitle>'
)

content = content.replace(
    '<CardTitle className="text-white flex items-center gap-2"><Network size={18} className="text-teal-400"/> Network Intelligence</CardTitle>',
    '<CardTitle className="text-white flex items-center gap-2"><Network size={18} className="text-teal-400"/> Network Intelligence {showExplainers && <FeatureExplainer text="Criminals rarely work alone. This map shows who is sending money to whom. Our AI automatically connects the dots to reveal hidden rings of bad actors sharing money." />}</CardTitle>'
)

content = content.replace(
    '<CardTitle className="text-white flex items-center gap-2"><FileText size={18} className="text-teal-400"/> Case & SAR Action</CardTitle>',
    '<CardTitle className="text-white flex items-center gap-2"><FileText size={18} className="text-teal-400"/> Case & SAR Action {showExplainers && <FeatureExplainer text="When you catch a criminal, you must report them to the government. This section lets you manage the case and automatically generates the official legal PDF report (SAR)." />}</CardTitle>'
)

content = content.replace(
    '<CardTitle className="text-white flex items-center gap-2"><Database size={18} className="text-teal-400"/> Dataset & Simulation</CardTitle>',
    '<CardTitle className="text-white flex items-center gap-2"><Database size={18} className="text-teal-400"/> Dataset & Simulation {showExplainers && <FeatureExplainer text="Criminals constantly change their tactics to trick our AI. We run automatic stress tests where we simulate fake criminal attacks against our own system to ensure our AI is always one step ahead." />}</CardTitle>'
)

content = content.replace(
    '<CardTitle className="text-white flex items-center gap-2"><AlertTriangle size={18} className="text-teal-400"/> AML Typologies</CardTitle>',
    '<CardTitle className="text-white flex items-center gap-2"><AlertTriangle size={18} className="text-teal-400"/> AML Typologies {showExplainers && <FeatureExplainer text="Here we detect classic money laundering tricks, like Structuring (breaking a large transfer into 50 tiny ones to avoid detection) or Pass-Through (money entering an account and leaving 2 minutes later)." />}</CardTitle>'
)

with open("app/page.tsx", "w") as f:
    f.write(content)

print("Done")
