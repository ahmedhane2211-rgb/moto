
function ToggleSwitch({ label, name, checked, onChange }) {
    return (
        <div className="toggle-wrapper">
            <label className="toggle-label">{label}</label>
            <label className="switch">
                <input
                    type="checkbox"
                    name={name}
                    checked={!!checked ?? 0}
                    onChange={onChange}
                />
                <span className="slider round"></span>
            </label>
        </div>
    );
}

export default ToggleSwitch;
