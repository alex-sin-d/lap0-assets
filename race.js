// --- Predefined finishing positions for each strategy ---
const resultScenarios = {
  "soft-medium":       { gasly: 4,  colapinto: 6 },  // One-stop Soft→Medium
  "soft-hard":         { gasly: 5,  colapinto: 7 },  // One-stop Soft→Hard
  "medium-soft":       { gasly: 1,  colapinto: 5 },  // One-stop Medium→Soft
  "medium-hard":       { gasly: 4,  colapinto: 6 },  // One-stop Medium→Hard
  "hard-soft":         { gasly: 6,  colapinto: 8 },  // One-stop Hard→Soft
  "hard-medium":       { gasly: 5,  colapinto: 7 },  // One-stop Hard→Medium
  "soft-medium-hard":  { gasly: 1,  colapinto: 4 },  // Two-stop Soft→Medium→Hard
  "soft-hard-medium":  { gasly: 2,  colapinto: 7 },  // Two-stop Soft→Hard→Medium
  "medium-soft-hard":  { gasly: 1,  colapinto: 3 },  // Two-stop Medium→Soft→Hard
  "medium-hard-soft":  { gasly: 2,  colapinto: 5 },  // Two-stop Medium→Hard→Soft
  "hard-soft-medium":  { gasly: 3,  colapinto: 4 },  // Two-stop Hard→Soft→Medium
  "hard-medium-soft":  { gasly: 4,  colapinto: 6 },  // Two-stop Hard→Medium→Soft
  "hard-hard":         { gasly: 10, colapinto: 19 }  // One-stop Hard→Hard
};
