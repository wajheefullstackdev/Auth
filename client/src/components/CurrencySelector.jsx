import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../features/authSlice';
import toast from 'react-hot-toast';

// A comprehensive array of world currencies
export const WORLD_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'United States Dollar' },
  { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound Sterling' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'AED', symbol: 'د.إ', name: 'United Arab Emirates Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'NZD', symbol: '$', name: 'New Zealand Dollar' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' }
];

const CurrencySelector = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);

    const currentCurrencyCode = user?.currency || 'USD';
    const currentCurrency = WORLD_CURRENCIES.find(c => c.code === currentCurrencyCode) || WORLD_CURRENCIES[0];

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter currencies based on search query
    const filteredCurrencies = WORLD_CURRENCIES.filter(currency => 
        currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        currency.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectCurrency = async (code) => {
        const result = await dispatch(updateProfile({ currency: code }));
        setIsOpen(false);
        setSearchQuery('');
        if (updateProfile.fulfilled.match(result)) {
            const currency = WORLD_CURRENCIES.find(c => c.code === code);
            toast.success(`Currency set to ${currency?.name || code}`);
        } else {
            toast.error('Failed to update currency');
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Dropdown Trigger Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-secondary/50 hover:bg-secondary border border-border text-foreground text-sm rounded-lg px-3 py-2 transition-colors outline-none focus:ring-1 focus:ring-primary"
            >
                <span className="font-semibold">{currentCurrency.code}</span>
                <span className="text-muted-foreground">({currentCurrency.symbol})</span>
                <ChevronDown size={16} className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-card rounded-xl border border-border shadow-xl z-[100] animate-fade-in overflow-hidden">
                    {/* Search Bar */}
                    <div className="p-3 border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <input 
                                type="text"
                                placeholder="Search currency..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Currency List */}
                    <div className="max-h-60 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent">
                        {filteredCurrencies.length > 0 ? (
                            filteredCurrencies.map((currency) => {
                                const isSelected = currency.code === currentCurrencyCode;
                                return (
                                    <button
                                        key={currency.code}
                                        onClick={() => handleSelectCurrency(currency.code)}
                                        className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-sm transition-colors ${isSelected ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-secondary/50 text-foreground'}`}
                                    >
                                        <div className="flex flex-col">
                                            <span>{currency.code} <span className="text-muted-foreground ml-1">({currency.symbol})</span></span>
                                            <span className="text-xs text-muted-foreground truncate max-w-[160px]">{currency.name}</span>
                                        </div>
                                        {isSelected && <Check size={16} className="text-primary flex-shrink-0" />}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="text-center py-4 text-sm text-muted-foreground">
                                No currencies found.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CurrencySelector;
