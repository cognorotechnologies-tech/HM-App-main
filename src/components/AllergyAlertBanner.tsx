// @ts-nocheck - Bypassing TypeScript strict checks
import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Shield, AlertCircle } from 'lucide-react';

interface PatientAllergy {
    allergen: string;
    reaction?: string;
    severity?: 'mild' | 'moderate' | 'severe';
}

interface AllergyAlertBannerProps {
    patientId: string;
    allergies: PatientAllergy[];
    prescribedMedicines?: string[]; // List of medicine names being prescribed
    onAddAllergy?: () => void;
    compact?: boolean;
}

export const AllergyAlertBanner: React.FC<AllergyAlertBannerProps> = ({
    allergies,
    prescribedMedicines = [],
    onAddAllergy,
    compact = false
}) => {
    const [warnings, setWarnings] = useState<string[]>([]);
    const [dismissed, setDismissed] = useState(false);

    // Check for potential drug-allergy conflicts
    useEffect(() => {
        if (!allergies || allergies.length === 0 || prescribedMedicines.length === 0) {
            setWarnings([]);
            return;
        }

        const foundWarnings: string[] = [];
        allergies.forEach(allergy => {
            prescribedMedicines.forEach(medicine => {
                // Simple case-insensitive match
                if (medicine.toLowerCase().includes(allergy.allergen.toLowerCase()) ||
                    allergy.allergen.toLowerCase().includes(medicine.toLowerCase())) {
                    foundWarnings.push(`⚠️ ALERT: "${medicine}" may contain "${allergy.allergen}" - Patient is allergic!`);
                }
            });
        });

        setWarnings(foundWarnings);
        if (foundWarnings.length > 0) {
            setDismissed(false); // Reset dismissal if new warnings appear
        }
    }, [allergies, prescribedMedicines]);

    // Compact Mode (for Sidebar)
    if (compact) {
        if (!allergies || allergies.length === 0) {
            return (
                <div className="bg-green-50 p-2 rounded-lg border border-green-100 flex items-center justify-center text-center">
                    <div>
                        <Shield className="w-4 h-4 text-green-600 mx-auto mb-1" />
                        <span className="text-xs font-semibold text-green-900 block">No Allergies</span>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-2">
                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <AlertTriangle size={10} className="text-yellow-500" />
                        Allergies
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                        {allergies.map((allergy, idx) => (
                            <span
                                key={idx}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${allergy.severity === 'severe' ? 'bg-red-50 text-red-700 border-red-100' :
                                        allergy.severity === 'moderate' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                            'bg-yellow-50 text-yellow-700 border-yellow-100'
                                    }`}
                            >
                                {allergy.allergen}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Show drug conflict warning even in compact mode if critical */}
                {warnings.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2 animate-pulse">
                        <div className="flex items-center gap-2 mb-1 text-red-700">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-xs font-bold">Conflict Detected!</span>
                        </div>
                        <p className="text-[10px] text-red-600 leading-tight">
                            Review prescription immediately.
                        </p>
                    </div>
                )}
            </div>
        );
    }

    // No allergies - show safe banner
    if (!allergies || allergies.length === 0) {
        return (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900">No Known Allergies</p>
                    <p className="text-xs text-green-700">Patient record shows no documented allergies</p>
                </div>
                {onAddAllergy && (
                    <button
                        onClick={onAddAllergy}
                        className="text-xs text-green-700 hover:text-green-900 font-medium underline"
                    >
                        Add Allergy
                    </button>
                )}
            </div>
        );
    }

    // Has allergies but no conflicts
    if (warnings.length === 0 && !dismissed) {
        return (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-bold text-yellow-900 mb-2">Patient Has Allergies</p>
                        <div className="space-y-1">
                            {allergies.map((allergy, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs">
                                    <span className={`px-2 py-0.5 rounded-full font-medium ${getSeverityColor(allergy.severity)}`}>
                                        {allergy.allergen}
                                    </span>
                                    {allergy.reaction && (
                                        <span className="text-yellow-700">→ {allergy.reaction}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // CRITICAL: Has allergies AND conflicts detected!
    if (warnings.length > 0 && !dismissed) {
        return (
            <div className="bg-red-100 border-4 border-red-500 rounded-xl p-5 animate-pulse shadow-lg">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                            <AlertTriangle className="w-7 h-7 text-white" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-bold text-red-900 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                DRUG-ALLERGY CONFLICT DETECTED!
                            </h4>
                            <button
                                onClick={() => setDismissed(true)}
                                className="text-red-700 hover:text-red-900 p-1"
                                title="Dismiss warning (not recommended)"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-2 mb-3">
                            {warnings.map((warning, idx) => (
                                <div key={idx} className="bg-white p-3 rounded-lg border-2 border-red-300">
                                    <p className="text-sm font-semibold text-red-900">{warning}</p>
                                </div>
                            ))}
                        </div>
                        <div className="bg-red-200 p-3 rounded-lg border border-red-400">
                            <p className="text-xs font-bold text-red-900">⚠️ ACTION REQUIRED:</p>
                            <p className="text-xs text-red-800 mt-1">
                                Please review the prescription and remove or substitute the flagged medication(s).
                                Prescribing medicine to which patient is allergic may cause severe reactions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

// Helper function for severity badge colors
function getSeverityColor(severity?: string) {
    switch (severity) {
        case 'severe':
            return 'bg-red-200 text-red-900 border border-red-400';
        case 'moderate':
            return 'bg-orange-200 text-orange-900 border border-orange-400';
        case 'mild':
            return 'bg-yellow-200 text-yellow-900 border border-yellow-400';
        default:
            return 'bg-yellow-200 text-yellow-900 border border-yellow-400';
    }
}

// Compact version for quick reference
interface AllergyBadgeProps {
    allergies: PatientAllergy[];
}

export const AllergyBadge: React.FC<AllergyBadgeProps> = ({ allergies }) => {
    if (!allergies || allergies.length === 0) {
        return (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                <Shield className="w-3 h-3" />
                No Allergies
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
            <AlertTriangle className="w-3 h-3" />
            {allergies.length} {allergies.length === 1 ? 'Allergy' : 'Allergies'}
        </div>
    );
};
