// ============================================
// Searchable Select Component
// Wraps react-select to be compatible with
// existing handleFilterChange(e) pattern
// ============================================

import Select from 'react-select';
import { useTranslation } from 'react-i18next';

const SearchableSelect = ({ name, value, onChange, options, placeholder }) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  // Find the currently selected option
  const selectedOption = options.find((opt) => String(opt.value) === String(value)) || null;

  // Emit a synthetic event compatible with handleFilterChange
  const handleChange = (selected) => {
    const syntheticEvent = {
      target: {
        name,
        value: selected ? selected.value : '',
      },
    };
    onChange(syntheticEvent);
  };

  // Custom styles to match Bootstrap form-select look
  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '38px',
      borderColor: state.isFocused ? '#86b7fe' : '#dee2e6',
      boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)' : 'none',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      '&:hover': {
        borderColor: state.isFocused ? '#86b7fe' : '#adb5bd',
      },
    }),
    option: (base, state) => ({
      ...base,
      fontSize: '0.875rem',
      backgroundColor: state.isSelected
        ? '#0d6efd'
        : state.isFocused
        ? '#e9ecef'
        : 'white',
      color: state.isSelected ? 'white' : '#212529',
      '&:active': {
        backgroundColor: '#0d6efd',
        color: 'white',
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: '#6c757d',
      fontSize: '0.875rem',
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: '0.875rem',
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  return (
    <Select
      name={name}
      value={selectedOption}
      onChange={handleChange}
      options={options}
      placeholder={placeholder}
      isClearable
      isSearchable
      isRtl={isRtl}
      styles={customStyles}
      noOptionsMessage={() => (isRtl ? 'لا توجد نتائج' : 'No options')}
    />
  );
};

export default SearchableSelect;
