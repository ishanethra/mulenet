import re

with open("app/page.tsx", "r") as f:
    content = f.read()

# The welcome modal starts with `<AnimatePresence>\n        {showWelcome && (`
# and ends right before `<div className="flex h-screen w-full flex-col bg-slate-950 font-sans text-slate-300">`

start_marker = "<AnimatePresence>\n        {showWelcome && ("
end_marker = '        )}\n      </AnimatePresence>\n\n      <div className="flex h-screen'

if start_marker in content and end_marker in content:
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker) + len('        )}\n      </AnimatePresence>\n')
    
    new_welcome = """      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center gap-10"
            >
              <div className="flex flex-col items-center gap-5 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-400 to-emerald-600 shadow-2xl shadow-teal-500/20">
                  <Shield className="h-12 w-12 text-slate-900" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold tracking-tight text-white mb-3">MULENET</h1>
                  <p className="text-lg text-slate-400 max-w-md mx-auto leading-relaxed">
                    AI-Powered Mule Account Detection &<br/>Financial Crime Intelligence Platform
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={() => setShowWelcome(false)}
                className="bg-teal-500 text-slate-950 hover:bg-teal-400 text-lg px-8 py-6 rounded-full shadow-[0_0_30px_rgba(20,184,166,0.3)] transition-all hover:shadow-[0_0_50px_rgba(20,184,166,0.5)] hover:scale-105"
              >
                Launch Intelligence Platform
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
"""
    
    content = content[:start_idx] + new_welcome + "\n" + content[content.find('<div className="flex h-screen'):]

    with open("app/page.tsx", "w") as f:
        f.write(content)
    print("Welcome screen updated.")
else:
    print("Could not find markers.")
