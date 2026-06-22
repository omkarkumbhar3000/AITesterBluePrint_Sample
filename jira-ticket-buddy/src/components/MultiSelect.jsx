import './MultiSelect.css'

function MultiSelect({ options, selected, onChange }) {
  function toggle(value) {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <div className="multiselect">
      <div className="multiselect-tags">
        {selected.length === 0 && (
          <span className="multiselect-placeholder">Select test types...</span>
        )}
        {selected.map(value => {
          const label = options.find(o => o.value === value)?.label || value
          return (
            <span key={value} className="multiselect-tag">
              {label}
              <button
                type="button"
                className="multiselect-tag-remove"
                onClick={() => toggle(value)}
              >
                &times;
              </button>
            </span>
          )
        })}
      </div>
      <div className="multiselect-dropdown">
        {options.map(opt => (
          <label key={opt.value} className="multiselect-option">
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={() => toggle(opt.value)}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

export default MultiSelect
