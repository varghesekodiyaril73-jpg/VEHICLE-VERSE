import React from 'react';

const Input = ({ label, type = "text", placeholder, value, onChange, name, icon: Icon }) => {
    return (
        <div className="mb-4">
            {label && <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>}
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full bg-black/30 border border-white/10 rounded-xl py-3 ${Icon ? 'pl-10' : 'pl-4'} pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[var(--accent-blue)] focus:ring-1 focus:ring-[var(--accent-blue)] transition-all`}
                />
            </div>
        </div>
    );
};

export default Input;
