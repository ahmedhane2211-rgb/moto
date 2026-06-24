import { FloatingLabel, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function MyInput({
  label,
  type = "text",
  value,
  onChange,
  required = false,
  error,
  as,
  options,
  disabled,
  name,
  dontShowDay = false,
  formData,
  percent,
  ...props
}) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordType = type === "password";
  const actualType = isPasswordType
    ? showPassword
      ? "text"
      : "password"
    : type;

  const today = new Date().toISOString().split("T")[0];
  const inputValue =
    type === "date" ? (dontShowDay ? value || "" : value || today) : value;

  return (
    <div className="my-input-container mb-3">
      <FloatingLabel
        label={
          <>
            {label}
            {required && (
              <span
                className="text-danger ms-1"
                style={{
                  fontSize: "1.6rem",
                  fontWeight: "bold",
                  verticalAlign: "middle",
                  marginRight: "5px",
                }}
              >
                *
              </span>
            )}
          </>
        }
      >
        {as === "select" ? (
          <Form.Select
          {...props}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            name={name}
          >
            {options.map((opt, i) => (
              <option key={i} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Form.Select>
        ) : (
          <>
            <Form.Control
              {...props}
              type={actualType}
              placeholder=" "
              value={inputValue}
              onChange={(e) => {
                if (type === "number" && Number(e.target.value) < 0) {
                  return;
                }
                onChange(e);
              }}
              className="mySA"
              
              required={required}
              name={name}
              disabled={disabled}
              dir={isRTL ? "rtl" : "ltr"}
              style={{
                height: "200px !important",
                textAlign: isRTL ? "right" : "left",
                paddingLeft:
                  percent && !isRTL
                    ? "30px"
                    : isPasswordType && !isRTL
                      ? "40px"
                      : undefined,
                paddingRight:
                  percent && isRTL
                    ? "30px"
                    : isPasswordType && isRTL
                      ? "40px"
                      : undefined,
              }}
            />

            {isPasswordType && (
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  right: isRTL ? "unset" : "12px",
                  left: isRTL ? "12px" : "unset",
                  zIndex: 5,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            )}

            {percent && (
              <span
                style={{
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#424040ff",
                  fontSize: "20px",
                  pointerEvents: "none",
                  right: isRTL ? "10px" : "unset",
                  left: !isRTL ? "10px" : "unset",
                }}
              >
                %
              </span>
            )}
          </>
        )}
      </FloatingLabel>
      {error && (
        <div className="text-danger mt-1" style={{ direction: "rtl" }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default MyInput;
