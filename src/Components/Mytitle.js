import { useTranslation } from "react-i18next";

function Mytitle(props) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <h2
      className="mb-4 text-center my-title no-print"
      style={{
        textAlign: isRTL ? "right" : "left",
      }}
    >
      {props.title}
    </h2>
  );
}

export default Mytitle;

