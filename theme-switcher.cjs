const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// Colors & Backgrounds
content = content.replace(/bg-\[\#030305\]/g, 'bg-[#f8f9fa]');
content = content.replace(/text-white\/60/g, 'text-slate-600');
content = content.replace(/text-white\/80/g, 'text-slate-700');
content = content.replace(/text-white\/30/g, 'text-slate-400');
content = content.replace(/text-white/g, 'text-slate-900');
content = content.replace(/border-white\/5/g, 'border-slate-900/5');
content = content.replace(/border-white\/10/g, 'border-slate-900/10');
content = content.replace(/border-white\/20/g, 'border-slate-900/20');
content = content.replace(/bg-white\/5/g, 'bg-slate-900/5');
content = content.replace(/hover:bg-white\/10/g, 'hover:bg-slate-900/10');
content = content.replace(/bg-white\/10/g, 'bg-slate-900/10');
content = content.replace(/hover:bg-white\/20/g, 'hover:bg-slate-900/20');
content = content.replace(/bg-black\/40/g, 'bg-white/40');
content = content.replace(/bg-black\/5/g, 'bg-slate-900/5');

// Animated gradients and glows (lighter pastel colors)
content = content.replace(/from-blue-900\/20/g, 'from-blue-100/50');
content = content.replace(/to-cyan-900\/20/g, 'to-cyan-100/50');
content = content.replace(/bg-blue-600\/20/g, 'bg-blue-300/30');
content = content.replace(/bg-cyan-500\/20/g, 'bg-cyan-300/30');
content = content.replace(/bg-cyan-500\/10/g, 'bg-cyan-400/20');
content = content.replace(/bg-purple-600\/10/g, 'bg-purple-300/20');

// Shadows
content = content.replace(/rgba\(255,255,255,0\.05\)/g, 'rgba(0,0,0,0.05)');
content = content.replace(/rgba\(255,255,255,0\.2\)/g, 'rgba(0,0,0,0.1)');
content = content.replace(/rgba\(124,58,237,0\.5\)/g, 'rgba(0,0,0,0.1)'); // Remove purple glow on image for a clean shadow

// Text reveal scroll
content = content.replace(/rgba\(255,255,255,0\.15\)/g, 'rgba(15,23,42,0.15)');
content = content.replace(/rgba\(220,234,34,1\)/g, 'rgba(15,23,42,1)'); // Manifesto turns dark slate instead of yellow for readability

// Inputs
content = content.replace(/bg-white\/5 border border-white\/10/g, 'bg-white border border-slate-200 shadow-sm');

// Buttons hover colors
content = content.replace(/hover:bg-white transition-colors/g, 'hover:bg-slate-900 hover:text-white transition-all');

// Modals/Pillars base
content = content.replace(/text-black/g, 'text-slate-900'); // Some places used text-black on primary buttons. We can keep text-slate-900.

fs.writeFileSync(file, content);
console.log('App.tsx theme converted to light mode.');
