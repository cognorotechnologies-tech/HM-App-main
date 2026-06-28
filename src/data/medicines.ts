export const commonMedicines = [
    // Analgesics & Antipyretics
    { name: "Paracetamol", category: "Analgesic", commonDosage: "500mg", commonFrequency: "1-1-1" },
    { name: "Ibuprofen", category: "NSAID", commonDosage: "400mg", commonFrequency: "1-0-1" },
    { name: "Diclofenac", category: "NSAID", commonDosage: "50mg", commonFrequency: "1-0-1" },
    { name: "Aspirin", category: "Analgesic", commonDosage: "75mg", commonFrequency: "0-0-1" },

    // Antibiotics
    { name: "Amoxicillin", category: "Antibiotic", commonDosage: "500mg", commonFrequency: "1-0-1" },
    { name: "Azithromycin", category: "Antibiotic", commonDosage: "500mg", commonFrequency: "1-0-0" },
    { name: "Ciprofloxacin", category: "Antibiotic", commonDosage: "500mg", commonFrequency: "1-0-1" },
    { name: "Doxycycline", category: "Antibiotic", commonDosage: "100mg", commonFrequency: "1-0-1" },
    { name: "Cefixime", category: "Antibiotic", commonDosage: "200mg", commonFrequency: "1-0-1" },

    // Antidiabetics
    { name: "Metformin", category: "Antidiabetic", commonDosage: "500mg", commonFrequency: "1-0-1" },
    { name: "Glimepiride", category: "Antidiabetic", commonDosage: "1mg", commonFrequency: "1-0-0" },
    { name: "Insulin Glargine", category: "Antidiabetic", commonDosage: "10 units", commonFrequency: "0-0-1" },

    // Antihypertensives
    { name: "Amlodipine", category: "Antihypertensive", commonDosage: "5mg", commonFrequency: "0-0-1" },
    { name: "Losartan", category: "Antihypertensive", commonDosage: "50mg", commonFrequency: "1-0-0" },
    { name: "Atenolol", category: "Antihypertensive", commonDosage: "50mg", commonFrequency: "1-0-0" },
    { name: "Ramipril", category: "Antihypertensive", commonDosage: "5mg", commonFrequency: "1-0-0" },

    // Gastrointestinal
    { name: "Omeprazole", category: "PPI", commonDosage: "20mg", commonFrequency: "1-0-0" },
    { name: "Pantoprazole", category: "PPI", commonDosage: "40mg", commonFrequency: "1-0-0" },
    { name: "Ranitidine", category: "H2 Blocker", commonDosage: "150mg", commonFrequency: "1-0-1" },
    { name: "Ondansetron", category: "Antiemetic", commonDosage: "4mg", commonFrequency: "1-0-1" },
    { name: "Domperidone", category: "Prokinetic", commonDosage: "10mg", commonFrequency: "1-1-1" },

    // Respiratory
    { name: "Salbutamol", category: "Bronchodilator", commonDosage: "2 puffs", commonFrequency: "As needed" },
    { name: "Montelukast", category: "Leukotriene", commonDosage: "10mg", commonFrequency: "0-0-1" },
    { name: "Cetirizine", category: "Antihistamine", commonDosage: "10mg", commonFrequency: "0-0-1" },
    { name: "Loratadine", category: "Antihistamine", commonDosage: "10mg", commonFrequency: "1-0-0" },

    // Vitamins & Supplements
    { name: "Vitamin D3", category: "Vitamin", commonDosage: "60,000 IU", commonFrequency: "Once weekly" },
    { name: "Vitamin B12", category: "Vitamin", commonDosage: "1000mcg", commonFrequency: "1-0-0" },
    { name: "Calcium Carbonate", category: "Supplement", commonDosage: "500mg", commonFrequency: "1-0-1" },
    { name: "Iron Supplement", category: "Supplement", commonDosage: "100mg", commonFrequency: "1-0-0" },

    // Cholesterol
    { name: "Atorvastatin", category: "Statin", commonDosage: "10mg", commonFrequency: "0-0-1" },
    { name: "Rosuvastatin", category: "Statin", commonDosage: "10mg", commonFrequency: "0-0-1" },

    // Antacids
    { name: "Magnesium Hydroxide", category: "Antacid", commonDosage: "10ml", commonFrequency: "1-1-1" },
    { name: "Sucralfate", category: "Gastroprotective", commonDosage: "1g", commonFrequency: "1-0-1" },
];

export const searchMedicines = (query: string) => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return commonMedicines.filter(med =>
        med.name.toLowerCase().includes(lowerQuery) ||
        med.category.toLowerCase().includes(lowerQuery)
    );
};
