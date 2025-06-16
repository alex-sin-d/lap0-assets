// --- Predefined finishing positions for each strategy ---
const resultScenarios = {
  "soft-medium":       { gasly: 4,  colapinto: 6,  comment: "Gasly held P4 while Colapinto took a solid sixth. Flavio nods proudly at their consistency." },  // One-stop Soft→Medium
  "soft-hard":         { gasly: 5,  colapinto: 7,  comment: "Gasly slipped to fifth with Colapinto following in seventh. Flavio jokes they owe him a better start next time." },  // One-stop Soft→Hard
  "medium-soft":       { gasly: 1,  colapinto: 5,  comment: "Gasly stormed to victory as Colapinto battled into the top five. Flavio is thrilled by that late soft charge." },  // One-stop Medium→Soft
  "medium-hard":       { gasly: 4,  colapinto: 6,  comment: "Both drivers maintained position and scored reliable points. Flavio waves approvingly at their no-drama approach." },  // One-stop Medium→Hard
  "hard-soft":         { gasly: 6,  colapinto: 8,  comment: "Starting on hards cost them spots but the soft stint clawed some back. Flavio can't decide whether to laugh or cry." },  // One-stop Hard→Soft
  "hard-medium":       { gasly: 5,  colapinto: 7,  comment: "Gasly finished fifth and Colapinto seventh after a steady run. Flavio grins that patience paid off." },  // One-stop Hard→Medium
  "soft-medium-hard":  { gasly: 1,  colapinto: 4,  comment: "Gasly dominated with a win while Colapinto crossed fourth on the two-stop. Flavio cheers loudly for the podium vibes." },  // Two-stop Soft→Medium→Hard
  "soft-hard-medium":  { gasly: 2,  colapinto: 7,  comment: "The hard stint slowed them, leaving Gasly second and Franco seventh. Flavio sighs yet keeps spirits high." },  // Two-stop Soft→Hard→Medium
  "medium-soft-hard":  { gasly: 1,  colapinto: 3,  comment: "Gasly claimed the victory and Franco grabbed a strong third. Flavio jumps around like it's a carnival." },  // Two-stop Medium→Soft→Hard
  "medium-hard-soft":  { gasly: 2,  colapinto: 5,  comment: "Careful tyre management set up a soft sprint to finish second and fifth. Flavio loves a strategy that pays off late." },  // Two-stop Medium→Hard→Soft
  "hard-soft-medium":  { gasly: 3,  colapinto: 4,  comment: "After a slow start on hards they rallied to third and fourth. Flavio calls it a proper rollercoaster." },  // Two-stop Hard→Soft→Medium
  "hard-medium-soft":  { gasly: 4,  colapinto: 6,  comment: "Gasly settled for fourth with Franco sixth thanks to a tidy strategy. Flavio says that was clever thinking." },  // Two-stop Hard→Medium→Soft
  "hard-hard":         { gasly: 10, colapinto: 19, comment: "Double hards left them struggling in tenth and nineteenth. Flavio winces and swears they'll never repeat that." }  // One-stop Hard→Hard
};
