import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faUpload } from "@fortawesome/free-solid-svg-icons";

const PremiumUploader = ({
  title,
  preview,
  onDelete,
  onChange,
  inputRef,
  name,
  accept,
}) => {
  console.log(preview)
  return (
    <div className="premium-upload-card">
      <div className="fw-bold mb-3">{title}</div>

      <div className="premium-image-box">
        {preview ? (
          <img src={preview} alt="preview" />
        ) : (
          <FontAwesomeIcon
            icon={faImage}
            style={{ fontSize: "40px", color: "#59245e9f" }}
          />
        )}

        <label className="upload-floating-btn">
          <FontAwesomeIcon icon={faUpload} />
          <input
            type="file"
            hidden
            name={name}
            onChange={onChange}
            ref={inputRef}
            accept={accept}
          />
        </label>
      </div>

      {preview && (
        <button className="delete-btn-premium" onClick={onDelete}>
          حذف
        </button>
      )}
    </div>
  );
};

export default PremiumUploader;
